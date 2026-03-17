# AWS Manual Deployment Guide

This guide provides a comprehensive, step-by-step walkthrough for manually deploying the Stock Option App (Angular frontend + Node.js backend) to AWS.

## Prerequisites

- An active GitHub account where your code is hosted.
- A basic understanding of navigating web interfaces.

---

## Phase 1: AWS Account & IAM Setup

### 1. Create an AWS Account

1. Go to [aws.amazon.com](https://aws.amazon.com) and click **Create an AWS Account**.
2. Follow the prompts to enter your email, password, and billing information (AWS has a generous Free Tier for the first 12 months).
3. Once created, sign in to the AWS Management Console as the **Root User**.

### 2. Create an IAM Admin User

_It is a security best practice to never use your Root User for day-to-day tasks._

1. In the AWS Console search bar, type **IAM** and select it.
2. In the left navigation pane, click **Users** -> **Add users**.
3. **User details**: Name the user (e.g., `admin-user`). Check the box for **Provide user access to the AWS Management Console**. Select **I want to create an IAM user**. Choose a custom password and uncheck "User must create a new password at next sign-in" if you prefer. Click **Next**.
4. **Permissions**: Select **Attach policies directly**.
5. Search for and check the box next to **AdministratorAccess**. Click **Next**.
6. Review and click **Create user**.
7. **Important**: Copy the Console sign-in URL provided. Log out of your Root account and log back in using this new URL and your `admin-user` credentials.

### 3. Create an IAM User for GitHub Actions (Programmatic Access)

_This user will allow GitHub to automatically build and push your Docker images to AWS._

1. Still in IAM, click **Users** -> **Add users**.
2. Name the user (e.g., `github-actions-user`). Click **Next**.
3. **Permissions**: Select **Attach policies directly**.
4. Search for and attach the following policy: **AmazonEC2ContainerRegistryPowerUser** (This allows pushing Docker images to ECR).
5. Click **Next**, then **Create user**.
6. Click on the newly created `github-actions-user`.
7. Go to the **Security credentials** tab.
8. Scroll down to **Access keys** and click **Create access key**.
9. Select **Third-party service** (or "Other"), acknowledge the warning, and click **Next** -> **Create access key**.
10. **CRITICAL**: Copy both the **Access key ID** and the **Secret access key**. You will need these for GitHub. Do not lose the Secret access key; it will never be shown again.


---

## Phase 2: Backend Deployment (Docker & App Runner)

### 1. Create an Elastic Container Registry (ECR)

_This is where your built Docker images will be stored._

1. Choose reagion 
 1.2 In the AWS Console search bar, type **ECR** and select **Elastic Container Registry**.
2. Click **Create repository**.
3. **Visibility settings**: Leave as **Private**.
4. **Repository name**: Enter `stock-app-backend`.
5. Scroll down to the bottom and click **Create repository**.
6. Note the **URI** of your new repository (it looks like `123456789012.dkr.ecr.us-east-1.amazonaws.com/stock-app-backend`).

930698106431.dkr.ecr.ap-southeast-2.amazonaws.com/stock-app-backend

### 2. Configure GitHub Secrets

_We must give GitHub the keys to push to your new ECR repository._

1. Go to your repository on **GitHub.com**.
2. Go to your repository (example): https://github.com/<your-username>/<your-repo>
  2.1. Click the **Settings** tab -> **Secrets and variables** (on the left) -> **Actions**.
3. Click **New repository secret** and add the following exactly as named:
   - Go to the IAM -> Users -> Your-IAM-git-user
   - **Name**: `AWS_ACCESS_KEY_ID` | **Value**: (Paste the Access Key ID from Phase 1, Step 3)
   - **Name**: `AWS_SECRET_ACCESS_KEY` | **Value**: (Paste the Secret Access Key from Phase 1, Step 3)
   - **Name**: `AWS_REGION` | **Value**: Your AWS region (e.g., `us-east-1` or `ap-south-1`. This is shown in the top right of your AWS console and in your ECR URI).

### 3. Setup GitHub Actions Workflow

1. In your local code editor, in the root of your project, create the following folder structure: `.github/workflows/`.
2. Inside that folder, create a file named `backend-deploy.yml` and paste the following code:
    Yes — indentation is absolutely mandatory in YAML (including GitHub Actions workflows).
    YAML is whitespace-sensitive, meaning:
```yaml
name: Deploy Backend to ECR

on:
  push:
    branches: ["main"] # Triggers on pushing to the main branch
    paths:
      - "backend/**" # Only triggers if files in the backend change

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build, tag, and push image to Amazon ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: stock-app-backend
          IMAGE_TAG: latest
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
```

3. Commit and push this file to GitHub. Go to the "Actions" tab on GitHub to watch it build and push your Docker image to AWS ECR.

### 4. Deploy to AWS App Runner

_App Runner takes your Docker image and runs it on the internet with an HTTPS URL._

1. Once the GitHub Action succeeds, go back to the AWS Console and search for **App Runner**.
2. Click **Create an App Runner service**.
3. **Source**: Select **Container registry**, then **Amazon ECR**.
4. Click **Browse** and select your `stock-app-backend` image. Leave the tag as `latest`.
5. **Deployment settings**: Choose **Automatic** (so it updates whenever you push new code). Next to ECR access role, select **Create new service role**. Click **Next**.
6. **Service name**: Enter `stock-app-backend-service`.
7. **Port**: Enter `3000` (This must match your Express/Node.js port).
8. **Environment variables**: This is the most important part. Expand this section and add all your `.env` variables:
   - `MONGO_URI` = (Your MongoDB Atlas connection string)
   - `OPENAI_API_KEY` = (Your key)
   - `ANTHROPIC_API_KEY` = (Your key)
   - `DEEPSEEK_API_KEY` = (Your key)
   - `FRONTEND_URL` = (We will set this later to your S3/CloudFront URL to allow CORS)
9. Scroll securely to the bottom and click **Next**, then review and click **Create & deploy**.
10. Wait 5-10 minutes. Once the status says "Running", copy the **Default domain** URL (e.g., `https://xyz123.us-east-1.awsapprunner.com`). This is your new live backend URL!

### 5. Update MongoDB Network Access

1. Go to MongoDB Atlas.
2. Under "Network Access", ensure you have allowed traffic from anywhere (`0.0.0.0/0`). App Runner IP addresses are dynamic, so whitelisting `0.0.0.0/0` is required unless you set up an advanced VPC configuration in AWS. Ensure your database relies heavily on the strong username/password in your `MONGO_URI`.

---

## Phase 3: Frontend Deployment (S3 & CloudFront)

### 1. Update Frontend Code

1. In `frontend/src/environments/environment.prod.ts`, change the `apiUrl` to point to the new App Runner URL you copied.
   ```typescript
   export const environment = {
     production: true,
     apiUrl: "https://YOUR_APP_RUNNER_URL.us-east-1.awsapprunner.com/api/v1",
   };
   ```
2. Run the production build command locally: `cd frontend && npm run build`. This creates a `dist/frontend/browser` folder.

### 2. Create S3 Bucket

1. Go to the AWS Console and search for **S3**.
2. Click **Create bucket**.
3. **Bucket name**: Enter a unique name (e.g., `my-stock-option-app-frontend-123`).
4. **Object Ownership**: Leave as ACLs disabled.
5. **Block Public Access settings**: Uncheck "Block _all_ public access" and acknowledge the warning.
6. Click **Create bucket**.
7. Click into your new bucket. Go to the **Properties** tab.
8. Scroll to the very bottom to **Static website hosting**. Click **Edit**.
9. Select **Enable**. For both "Index document" and "Error document", enter `index.html` (this is crucial for Angular routing). Click **Save**.

### 3. Set S3 Bucket Policy

1. Go to the **Permissions** tab of your bucket.
2. Under **Bucket policy**, click **Edit**.
3. Paste the following JSON, replacing `YOUR_BUCKET_NAME` with your actual bucket name:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

4. Click **Save**.

### 4. Upload Files

1. Go to the **Objects** tab of your bucket.
2. Click **Upload**.
3. Drag and drop all the _contents_ (files and folders) from inside your local `frontend/dist/frontend/browser` folder into the upload box.
4. Click **Upload**.
5. Go back to the **Properties** tab, scroll to the bottom, and click the blue "Bucket website endpoint" link. Your site is now live!

### 5. Setup CloudFront (Optional but highly recommended for HTTPS)

_S3 static websites only provide HTTP. CloudFront provides HTTPS and caching._

1. In the AWS Console search bar, type **CloudFront** and select it.
2. Click **Create distribution**.
3. **Origin domain**: Click the box and select your S3 bucket from the dropdown (IMPORTANT: do _not_ select the one that says `.s3-website-`, select the standard one: `YOUR_BUCKET.s3.amazonaws.com`).
4. **Origin access**: Select **Origin access control settings (recommended)**. Click **Create control setting** and save it.
5. **Default cache behavior**: Under Viewer, set "Viewer protocol policy" to **Redirect HTTP to HTTPS**.
6. **Web Application Firewall (WAF)**: Select "Do not enable security protections" (unless you want to pay for them).
7. Scroll down to **Default root object** and type `index.html`.
8. Click **Create distribution**.
9. The console will give you a yellow banner saying to update your S3 bucket policy. Click **Copy policy**, then click the blue link that takes you to the S3 bucket permissions. Click "Edit" under bucket policy, delete the old public policy, and paste the new one AWS generated for you.
10. Wait 5-10 minutes for the CloudFront distribution state to change to "Enabled". Access your app using the CloudFront "Distribution domain name" (e.g., `d123456abcdef.cloudfront.net`).

11. _Angular Routing Fix in CloudFront_: Go to your distribution -> **Error pages** -> **Create custom error response**. Choose HTTP error code `404: Not Found`, select Customize Error Response `Yes`, response page path `/index.html`, HTTP response code `200: OK`. Click create. Repeat for `403`. This ensures page refreshes work in Angular!

---

## Phase 4: Final Polish

1. **Update Backend CORS**: Now that your frontend has a live CloudFront URL, go back to your App Runner service settings. Under Configuration -> Environment variables, update the `FRONTEND_URL` to match your CloudFront URL (e.g., `https://d123456abcdef.cloudfront.net`) without a trailing slash. Restart the App Runner service.

_Your application is now fully separated and deployed on AWS!_
