# Jenkins CI/CD Setup Guide for Gram Mitra Backend

This document provides a comprehensive step-by-step guide to set up and run Jenkins CI/CD pipeline for the **Gram Mitra Backend** project.

---

## Architecture Overview

The CI/CD workflow defined in [`Jenkinsfile`](file:///c:/Users/kirve/OneDrive/Desktop/gram-mitra/backend/Jenkinsfile) performs the following stages automatically:

1. **Checkout Code**: Retrieves the latest backend code from the Git repository.
2. **Install Dependencies**: Runs `npm ci` for clean node package installation.
3. **Run Automated Tests**: Executes unit & integration tests via Jest (`npm test`).
4. **Code Quality (SonarQube)**: Performs code quality analysis *(optional)*.
5. **Security Scan (Trivy)**: Scans workspace for security vulnerabilities *(optional)*.
6. **Docker Build**: Builds production Docker image tagged with build number and `latest`.
7. **Docker Push**: Pushes built image to container registry *(optional)*.
8. **Deploy Application**: Deploys/restarts the backend container using `docker compose`.

---

## Step 1: Start Jenkins locally using Docker Compose

We provide a dedicated Docker Compose file [`docker-compose.jenkins.yml`](file:///c:/Users/kirve/OneDrive/Desktop/gram-mitra/backend/docker-compose.jenkins.yml) to launch Jenkins with Docker engine access.

Run the following command from the `backend` directory:

```bash
docker compose -f docker-compose.jenkins.yml up -d
```

Verify the container is running:
```bash
docker ps --filter "name=gram-mitra-jenkins"
```

---

## Step 2: Unlock and Setup Jenkins

1. Open your browser and navigate to: **[http://localhost:8080](http://localhost:8080)**

2. Retrieve the initial admin password from the Jenkins container logs:
   ```bash
   docker exec -it gram-mitra-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```

3. Paste the password into the Jenkins Web UI unlock screen.
4. Select **"Install suggested plugins"** and wait for installation to finish.
5. Create your initial **Admin User** account and finish setup.

---

## Step 3: Install Required Jenkins Plugins

Navigate to **Manage Jenkins** -> **Plugins** -> **Available plugins** and ensure the following plugins are installed:

- **Git Plugin** (installed by default)
- **Pipeline Plugin** (installed by default)
- **Docker Pipeline** (`docker-workflow`)
- **NodeJS Plugin** (Optional if Node is installed directly inside agent/container)

---

## Step 4: Create the Jenkins Pipeline Job

1. On the Jenkins dashboard, click **"New Item"**.
2. Enter item name: `gram-mitra-backend-pipeline`.
3. Select **"Pipeline"** and click **OK**.
4. In the job configuration page:
   - **Build Triggers**: Check *GitHub hook trigger for GPRSCM polling* or *Poll SCM* (e.g., `H/5 * * * *` for every 5 mins).
   - **Pipeline Section**:
     - Definition: **Pipeline script from SCM**
     - SCM: **Git**
     - Repository URL: `https://github.com/<your-username>/gram-mitra-backend.git` (or local file/repo path)
     - Branch Specifier: `*/main` or `*/master`
     - Script Path: `Jenkinsfile`
5. Click **Save**.

---

## Step 5: (Optional) Set Docker Registry Credentials

If you plan to push images to Docker Hub or AWS ECR in Stage 7:

1. Go to **Manage Jenkins** -> **Credentials** -> **System** -> **Global credentials**.
2. Click **Add Credentials**:
   - Kind: **Username with password**
   - ID: `docker-registry-credentials`
   - Username: Your Docker Hub / Registry username
   - Password: Your Docker Hub Personal Access Token or password
3. Click **Create**.

---

## Step 6: Run the Pipeline

1. Click **"Build Now"** on the pipeline job page.
2. Monitor real-time logs under **Console Output** to verify all stages complete successfully.

---

## Troubleshooting Tips

- **Docker socket permission denied**: If Jenkins inside container cannot communicate with `/var/run/docker.sock`, ensure container runs with root user or add jenkins user to host docker group.
- **npm command not found**: Ensure `npm` is accessible on the runner host or inside container environment.
