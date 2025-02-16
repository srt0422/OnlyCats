#!/bin/bash

# Configuration
PROJECT_ID="your-project-id"
DB_INSTANCE_NAME="onlycats-db"
DB_NAME="onlycats"
DB_USER="onlycats_admin"
DB_TIER="db-f1-micro"
REGION="us-central1"

# Set the project
echo "Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Check if database instance exists
echo "Checking for existing database instance..."
if ! gcloud sql instances describe "$DB_INSTANCE_NAME" &>/dev/null; then
  echo "Creating new Cloud SQL instance..."
  # Generate a random password for the database user
  DB_PASSWORD=$(openssl rand -base64 32)
  
  # Create Cloud SQL instance
  gcloud sql instances create "$DB_INSTANCE_NAME" \
    --database-version=POSTGRES_15 \
    --tier=$DB_TIER \
    --region=$REGION \
    --storage-size=10GB \
    --storage-type=SSD \
    --availability-type=zonal \
    --backup-start-time=23:00 \
    --backup-retention-count=4 \
    --retained-backups-count=4 \
    --retained-transaction-log-days=30 \
    --database-flags=max_connections=100

  # Configure weekly backups (Sunday at 23:00)
  gcloud sql instances patch "$DB_INSTANCE_NAME" \
    --backup-configuration="enabled=true,startTime=23:00,backupRetention=30d,weeklyBackup='sunday=true,monday=false,tuesday=false,wednesday=false,thursday=false,friday=false,saturday=false'"

  # Create database
  echo "Creating database..."
  gcloud sql databases create "$DB_NAME" --instance="$DB_INSTANCE_NAME"

  # Create user
  echo "Creating database user..."
  gcloud sql users create "$DB_USER" \
    --instance="$DB_INSTANCE_NAME" \
    --password="$DB_PASSWORD"

  # Get the instance connection name
  INSTANCE_CONNECTION_NAME=$(gcloud sql instances describe "$DB_INSTANCE_NAME" --format="value(connectionName)")

  # Construct the DATABASE_URL
  DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?host=/cloudsql/$INSTANCE_CONNECTION_NAME"

  echo "
Database setup complete. Please add these values as secrets to your GitHub repository:

DATABASE_URL: $DATABASE_URL
NEXTAUTH_URL: https://only-cats-xxxxx-uc.a.run.app (replace xxxxx with the assigned URL after first deployment)
NEXTAUTH_SECRET: $(openssl rand -base64 32)

Note: After the first deployment, update NEXTAUTH_URL with the actual Cloud Run URL.
"
else
  echo "Database instance already exists. Please check your existing configuration for the database connection details."
fi 