# Managing Multiple Environments (Dev, Staging, Prod) in AWS & GitHub

When moving from a single testing environment to a professional setup, you need separate environments to test your code before actual users see it in production. 

This guide covers how to **manually** handle and map multiple environments (e.g., `dev` and `prod`) using Git branches, Angular environments, and AWS resources.

---

## Step 1: Git Branching Strategy
You must physically separate your code in GitHub using branches.
1. Create a `main` branch. This represents **Production** (the real app).
2. Create a `dev` branch. This represents **Development** (where you test new features).

When you code locally, you work on your own machine. When you finish, you push to the `dev` branch. Once it is tested and verified, you create a "Pull Request" to merge `dev` into `main`.

---

## Step 2: Separate Your AWS Infrastructure
You **must** create separate cloud resources for each environment. If you deploy `dev` code to your `prod` database, you risk deleting user data!

### 1. MongoDB (Database)
- In MongoDB Atlas, you don't need a whole new cluster. Inside your existing cluster, simply change your Application's database name in the connection string.
- *Dev:* `mongodb+srv://...net/stock-options-dev`
- *Prod:* `mongodb+srv://...net/stock-options-prod`

### 2. AWS App Runner (Backend)
- Manually create **two** separate App Runner services (one named `backend-dev` and one named `backend-prod`).
- Give `backend-dev` the Dev MongoDB URI. Give `backend-prod` the Prod MongoDB URI.

### 3. AWS S3 (Frontend)
- Create **two** separate S3 Buckets for static website hosting.
- Example: `my-stock-option-app-dev.s3-website.amazonaws.com`
- Example: `my-stock-option-app-prod.s3-website.amazonaws.com`

---

## Step 3: Handle Multiple Environments in Angular
Angular needs to know which backend to talk to depending on the environment.

1. Go to `frontend/src/environments/`
2. Keep `environment.ts` (This is for your `localhost:3000` testing).
3. Create `environment.dev.ts`:
   ```typescript
   export const environment = {
       production: false,
       apiUrl: 'https://dev-xyz123.awsapprunner.com/api/v1' // Your DEV App Runner URL
   };
   ```
4. Create/Edit `environment.prod.ts`:
   ```typescript
   export const environment = {
       production: true,
       apiUrl: 'https://prod-xyz123.awsapprunner.com/api/v1' // Your PROD App Runner URL
   };
   ```

5. Go into `angular.json` and configure **file replacements** for both `production` and `development` configurations so Angular knows which file to swap out when you run `ng build --configuration=production` or `ng build --configuration=development`.

---

## Step 4: GitHub Actions (Manual Deployments & Secrets)
To automatically (or manually) deploy to these two different AWS setups depending on the branch, you need separate GitHub workflows and secrets.

### 1. Add Environment Variables to GitHub Secrets
Go to GitHub -> Settings -> Secrets and Variables -> Actions.
Add the specific variables:
- `AWS_S3_BUCKET_DEV`
- `AWS_S3_BUCKET_PROD`

### 2. Create Workflow Files
Inside your `.github/workflows/` folder, create two separated files.

**File 1: `.github/workflows/deploy-dev.yml`**
```yaml
name: Deploy Frontend - DEV
on:
  push:
    branches: [ "dev" ]               # Auto-triggers when you push to dev
  workflow_dispatch:                  # Allows you to click a "Manually Deploy" button in GitHub!
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm run build --configuration=development # Tells Angular to use environment.dev.ts
      
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1

      - name: Deploy to DEV S3
        run: aws s3 sync dist/frontend/browser s3://${{ secrets.AWS_S3_BUCKET_DEV }} --delete
```

**File 2: `.github/workflows/deploy-prod.yml`**
```yaml
name: Deploy Frontend - PROD
on:
  push:
    branches: [ "main" ]             # Auto-triggers when you push to main
  workflow_dispatch:                 # Allows you to click a "Manually Deploy" button in GitHub!
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm run build --configuration=production # Tells Angular to use environment.prod.ts
      
      # (Same AWS Configuration step as above)

      - name: Deploy to PROD S3
        run: aws s3 sync dist/frontend/browser s3://${{ secrets.AWS_S3_BUCKET_PROD }} --delete
```

### The "workflow_dispatch" Magic (Manual Trigger)
Because I added `workflow_dispatch:` to the YAML files above, whenever you go to the **Actions** tab in GitHub, you will see a button that says **"Run Workflow"**. 
This allows you to completely control and trigger deployments manually using the GitHub UI, without having to actually push code!
