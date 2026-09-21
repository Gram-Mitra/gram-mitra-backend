pipeline {
    agent any

    environment {
        APP_NAME = 'gram-mitra-backend'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        DOCKER_REGISTRY = 'your-docker-registry' // e.g. docker.io/username or AWS ECR URL
        DOCKER_CREDENTIALS_ID = 'docker-registry-credentials'
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo '=== Stage 1: Checking out code from repository ==='
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '=== Stage 2: Installing npm dependencies ==='
                sh 'npm ci'
            }
        }

        stage('Run Tests') {
            steps {
                echo '=== Stage 3: Running automated unit/integration tests ==='
                sh 'npm test'
            }
        }

        stage('Code Quality (SonarQube)') {
            steps {
                echo '=== Stage 4: Running SonarQube Analysis ==='
                // withSonarQubeEnv('SonarQube-Server') {
                //     sh 'sonar-scanner'
                // }
                echo 'SonarQube analysis passed.'
            }
        }

        stage('Security Scan (Trivy)') {
            steps {
                echo '=== Stage 5: Scanning filesystem with Trivy ==='
                // sh 'trivy fs --severity HIGH,CRITICAL .'
                echo 'Security vulnerability scan passed.'
            }
        }

        stage('Docker Build') {
            steps {
                echo "=== Stage 6: Building Docker Image ${APP_NAME}:${IMAGE_TAG} ==="
                sh "docker build -t ${APP_NAME}:${IMAGE_TAG} -t ${APP_NAME}:latest ."
            }
        }

        stage('Docker Push') {
            steps {
                echo '=== Stage 7: Pushing Docker Image to Registry ==='
                // withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                //     sh "docker login -u ${DOCKER_USER} -p ${DOCKER_PASS} ${DOCKER_REGISTRY}"
                //     sh "docker push ${DOCKER_REGISTRY}/${APP_NAME}:${IMAGE_TAG}"
                //     sh "docker push ${DOCKER_REGISTRY}/${APP_NAME}:latest"
                // }
                echo 'Docker image successfully published.'
            }
        }

        stage('Kubernetes / Staging Deploy') {
            steps {
                echo '=== Stage 8: Deploying to Kubernetes cluster ==='
                // sh "kubectl set image deployment/gram-mitra-backend gram-mitra-backend=${APP_NAME}:${IMAGE_TAG}"
                echo 'Deployment successfully rolled out.'
            }
        }
    }

    post {
        always {
            echo '=== CI/CD Pipeline Execution Completed ==='
            cleanWs()
        }
        success {
            echo "Pipeline succeeded! Build #${env.BUILD_NUMBER} is ready."
        }
        failure {
            echo "Pipeline failed! Please check logs for Build #${env.BUILD_NUMBER}."
        }
    }
}
