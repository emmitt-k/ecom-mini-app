# CI/CD Setup Guide

This guide explains how to set up the CI/CD pipeline with GitHub Actions and AWS.

## Overview

The pipeline consists of:
- **CI Workflow**: Runs tests and builds on every PR
- **Staging Deployment**: Auto-deploys to staging on merge to main
- **Production Deployment**: Manual trigger for production releases
- **Database Migration**: Manual workflow for running migrations

## AWS Resources Required

### 1. ECR Repositories

Create two repositories in Amazon ECR:

```bash
aws ecr create-repository --repository-name ecom-backend --region ap-southeast-1
aws ecr create-repository --repository-name ecom-frontend --region ap-southeast-1
```

### 2. ECS Cluster and Services

Create ECS cluster and services:

```bash
# Create cluster
aws ecs create-cluster --cluster-name ecom-cluster --region ap-southeast-1

# Create task definitions and services for:
# - ecom-backend-staging
# - ecom-frontend-staging
# - ecom-backend-prod
# - ecom-frontend-prod
```

Task definitions should:
- Use AWS Secrets Manager for environment variables
- Reference ECR images
- Configure appropriate CPU/memory
- Set up health checks

### 3. IAM OIDC Provider (Recommended)

Instead of storing AWS access keys in GitHub, use OIDC for secure authentication:

```bash
# Create OIDC provider for GitHub
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --thumbprint-list 6938fd4e98bab03faadb97b34396831e3780aea1 \
  --client-id-list sts.amazonaws.com
```

### 4. IAM Role for GitHub Actions

Create a role that GitHub Actions can assume:

**Trust Policy** (`github-actions-trust-policy.json`):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:yourusername/ecom-mini-app:*"
        }
      }
    }
  ]
}
```

**Permissions Policy** (`github-actions-policy.json`):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload",
        "ecr:PutImage"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:DescribeServices",
        "ecs:UpdateService",
        "ecs:DescribeClusters"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:PassRole"
      ],
      "Resource": "*"
    }
  ]
}
```

Create the role:
```bash
aws iam create-role \
  --role-name GitHubActionsECSRole \
  --assume-role-policy-document file://github-actions-trust-policy.json

aws iam put-role-policy \
  --role-name GitHubActionsECSRole \
  --policy-name GitHubActionsECSPolicy \
  --policy-document file://github-actions-policy.json
```

### 5. Secrets Manager

Store environment variables in AWS Secrets Manager:

```bash
# Staging backend secrets
aws secretsmanager create-secret \
  --name /ecom/staging/backend \
  --secret-string '{
    "DB_HOST": "your-staging-db-host",
    "DB_PORT": "5432",
    "DB_USERNAME": "postgres",
    "DB_PASSWORD": "your-password",
    "DB_DATABASE": "ecommerce",
    "JWT_SECRET": "your-jwt-secret",
    "JWT_REFRESH_SECRET": "your-refresh-secret"
  }'

# Production backend secrets
aws secretsmanager create-secret \
  --name /ecom/production/backend \
  --secret-string '{
    "DB_HOST": "your-prod-db-host",
    "DB_PORT": "5432",
    "DB_USERNAME": "postgres",
    "DB_PASSWORD": "your-password",
    "DB_DATABASE": "ecommerce",
    "JWT_SECRET": "your-jwt-secret",
    "JWT_REFRESH_SECRET": "your-refresh-secret"
  }'
```

## GitHub Secrets Configuration

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

| Secret Name | Description | Example |
|------------|-------------|---------|
| `AWS_ACCOUNT_ID` | Your AWS account ID | `123456789012` |
| `AWS_ROLE_ARN` | ARN of the IAM role | `arn:aws:iam::123456789012:role/GitHubActionsECSRole` |

For database migrations, also add:

| Secret Name | Description |
|------------|-------------|
| `DB_HOST` | Database host |
| `DB_PORT` | Database port (5432) |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `DB_DATABASE` | Database name |

## Workflow Triggers

### CI Pipeline
- **Trigger**: Pull request to `main` or push to `main`
- **Jobs**: Lint, test (unit + integration), build validation

### Staging Deployment
- **Trigger**: Push to `main` (after CI passes)
- **Jobs**: Build images → Push to ECR → Deploy to ECS staging

### Production Deployment
- **Trigger**: Manual (workflow_dispatch)
- **Jobs**: Promote staging images → Deploy to ECS production

### Database Migration
- **Trigger**: Manual (workflow_dispatch)
- **Select**: Environment (staging/production)
- **Jobs**: Run TypeORM migrations

## Deployment Flow

```
Developer pushes to main
        │
        ▼
┌─────────────────┐
│   CI Pipeline   │─── Tests, Lint, Build
└────────┬────────┘
         │ (if passed)
         ▼
┌─────────────────┐
│  Build Images   │─── Tag: staging-<sha>
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Push to ECR    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Deploy Staging  │─── ECS Rolling Update
└────────┬────────┘
         │
         ▼
    [Manual Trigger]
         │
         ▼
┌─────────────────┐
│ Promote Images  │─── Tag: prod-<sha>
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Deploy Production│─── ECS Rolling Update
└─────────────────┘
```

## Testing the Pipeline

1. **Create a PR**: CI workflow should run automatically
2. **Merge PR**: Staging deployment should trigger
3. **Verify staging**: Check the deployed application
4. **Deploy to prod**: Go to Actions → Deploy to Production → Run workflow
5. **Run migrations**: Go to Actions → Database Migration → Select environment → Run

## Troubleshooting

### CI Fails
- Check test logs in GitHub Actions
- Verify Node.js version compatibility
- Ensure all dependencies are in package.json

### Deployment Fails
- Check ECS service events in AWS Console
- Verify IAM role permissions
- Check ECR image exists and is accessible

### Migration Fails
- Check database connectivity
- Verify secrets are correct in Secrets Manager
- Review migration SQL for errors

## Security Best Practices

✅ **Implemented:**
- OIDC authentication (no long-lived AWS keys)
- Secrets in AWS Secrets Manager (not in code)
- Manual approval for production deployments
- Image tagging strategy (sha-based + environment)
- Least-privilege IAM policies

## Cost Optimization

- Use Fargate Spot for non-critical workloads
- Set up ECR lifecycle policies to delete old images
- Use Application Load Balancer efficiently
- Monitor and set billing alerts

## Next Steps

1. Set up monitoring (CloudWatch dashboards)
2. Configure alerting (SNS → Email/Slack)
3. Add automated rollback on health check failure
4. Implement blue-green deployment for zero downtime
5. Set up CDN for static assets (CloudFront)
