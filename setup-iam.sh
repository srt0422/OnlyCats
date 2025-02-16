#!/bin/bash

# Configuration
PROJECT_ID="your-project-id"
POOL_NAME="github-actions-pool"
PROVIDER_NAME="github-provider"
SERVICE_ACCOUNT_NAME="github-actions-service"
REPO_NAME="OnlyCats"
REGION="us-central1"

# Enable necessary APIs
echo "Enabling necessary APIs..."
gcloud services enable \
  cloudresourcemanager.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  vpcaccess.googleapis.com

# Create Workload Identity Pool
echo "Creating Workload Identity Pool..."
gcloud iam workload-identity-pools create "$POOL_NAME" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Get the Workload Identity Pool ID
POOL_ID=$(gcloud iam workload-identity-pools describe "$POOL_NAME" \
  --location="global" \
  --format="value(name)")

# Create Workload Identity Provider
echo "Creating Workload Identity Provider..."
gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_NAME" \
  --location="global" \
  --workload-identity-pool="$POOL_NAME" \
  --display-name="GitHub provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Create Service Accounts
echo "Creating Service Accounts..."
# GitHub Actions Service Account
gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" \
  --display-name="GitHub Actions Service Account"

# Cloud SQL Auth Proxy Service Account
gcloud iam service-accounts create cloud-sql-proxy \
  --display-name="Cloud SQL Auth Proxy"

# Grant necessary permissions
echo "Granting necessary permissions..."
# GitHub Actions Service Account permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Cloud SQL Auth Proxy permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:cloud-sql-proxy@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

# Allow GitHub Actions to use the service account
echo "Configuring Workload Identity Federation..."
gcloud iam service-accounts add-iam-policy-binding "$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${POOL_ID}/attribute.repository/scottterry/$REPO_NAME"

# Allow the Cloud Run service account to use the Cloud SQL Auth proxy
gcloud iam service-accounts add-iam-policy-binding cloud-sql-proxy@$PROJECT_ID.iam.gserviceaccount.com \
  --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create VPC connector for Cloud Run to Cloud SQL connection
echo "Creating VPC connector..."
gcloud compute networks vpc-access connectors create serverless-vpc \
  --region=$REGION \
  --range=10.8.0.0/28 \
  --network=default

# Get the Workload Identity Provider resource name
PROVIDER_NAME=$(gcloud iam workload-identity-pools providers describe "$PROVIDER_NAME" \
  --location="global" \
  --workload-identity-pool="$POOL_NAME" \
  --format="value(name)")

# Output the values needed for GitHub Secrets
echo "
IAM setup complete. Please provide these values to the development team:

WIF_PROVIDER: $PROVIDER_NAME
WIF_SERVICE_ACCOUNT: $SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com

The development team will need these values as GitHub secrets to enable the CI/CD pipeline.
" 