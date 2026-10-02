pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        timeout(time: 20, unit: 'MINUTES')
        timestamps()
    }

    environment {
        APP_NAME = 'gram-mitra-backend'
        IMAGE_NAME = 'gram-mitra-backend:latest'
        DEPLOYMENT_NAME = 'gram-mitra-backend'
        SERVICE_NAME = 'gram-mitra-backend-service'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '=== Stage 1: Checking out code from GitHub ==='
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '=== Stage 2: Installing npm dependencies ==='
                bat 'npm ci'
            }
        }

        stage('Test') {
            steps {
                echo '=== Stage 3: Running Automated Tests ==='
                bat 'npm test'
            }
        }

        stage('Docker Build') {
            steps {
                echo "=== Stage 4: Building Docker Image ${IMAGE_NAME} ==="
                bat 'docker build -t gram-mitra-backend:latest .'
            }
        }

        stage('Load Image into Minikube') {
            steps {
                echo "=== Stage 5: Loading Docker Image into Minikube ==="
                bat 'minikube image load gram-mitra-backend:latest'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo '=== Stage 6: Applying Kubernetes Manifests ==='
                bat 'kubectl apply -f k8s/configmap.yaml'
                bat 'kubectl apply -f k8s/deployment.yaml'
                bat 'kubectl apply -f k8s/service.yaml'
            }
        }

        stage('Restart Deployment') {
            steps {
                echo "=== Stage 7: Rolling Restart of Deployment ${DEPLOYMENT_NAME} ==="
                bat 'kubectl rollout restart deployment/gram-mitra-backend'
            }
        }

        stage('Verify Deployment') {
            steps {
                echo "=== Stage 8: Verifying Deployment Rollout & Health ==="
                bat 'kubectl rollout status deployment/gram-mitra-backend --timeout=120s'
                bat 'kubectl get pods -l app=gram-mitra-backend'
                bat 'kubectl get services gram-mitra-backend-service'
            }
        }
    }

    post {
        always {
            echo '=== Pipeline Execution Finished ==='
        }
        success {
            echo '✅ Deployment SUCCESS: Both backend replicas are running the new Docker image on Minikube!'
        }
        failure {
            echo '❌ Deployment FAILED: Please inspect the logs above.'
        }
    }
}
