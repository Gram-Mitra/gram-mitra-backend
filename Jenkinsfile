pipeline {
    agent any

    environment {
        APP_NAME = 'gram-mitra-backend'
        IMAGE_TAG = "${env.BUILD_NUMBER ?: 'dev'}"
        DOCKER_REGISTRY = 'docker.io/username' // Change to your Docker Hub username or registry URL
        DOCKER_CREDENTIALS_ID = 'docker-registry-credentials'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
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

        stage('Run Automated Tests') {
            steps {
                echo '=== Stage 3: Running automated unit and integration tests ==='
                sh 'npm test'
            }
        }

        stage('Code Quality (SonarQube)') {
            steps {
                echo '=== Stage 4: Code Quality Scan ==='
                script {
                    echo 'SonarQube analysis stage ready. (Uncomment sonar-scanner step once SonarQube server is configured).'
                    // withSonarQubeEnv('SonarQube-Server') {
                    //     sh 'sonar-scanner -Dsonar.projectName=gram-mitra-backend -Dsonar.projectKey=gram-mitra-backend'
                    // }
                }
            }
        }

        stage('Security Vulnerability Scan (Trivy)') {
            steps {
                echo '=== Stage 5: Security Vulnerability Scan ==='
                script {
                    echo 'Trivy security scan stage ready. (Uncomment below once Trivy CLI is installed on runner).'
                    // sh 'trivy fs --severity HIGH,CRITICAL .'
                }
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
                script {
                    echo 'Skipping push to remote registry. Set up credentials with ID docker-registry-credentials to enable remote registry push.'
                    // withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    //     sh "docker login ${DOCKER_REGISTRY} -u ${DOCKER_USER} -p ${DOCKER_PASS}"
                    //     sh "docker tag ${APP_NAME}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${APP_NAME}:${IMAGE_TAG}"
                    //     sh "docker tag ${APP_NAME}:latest ${DOCKER_REGISTRY}/${APP_NAME}:latest"
                    //     sh "docker push ${DOCKER_REGISTRY}/${APP_NAME}:${IMAGE_TAG}"
                    //     sh "docker push ${DOCKER_REGISTRY}/${APP_NAME}:latest"
                    // }
                }
            }
        }

        stage('Deploy Application') {
            steps {
                echo '=== Stage 8: Deploying Application Container ==='
                sh 'docker compose up -d --build backend'
            }
        }
    }

    post {
        always {
            echo '=== CI/CD Pipeline Execution Finished ==='
            cleanWs()
        }
        success {
            echo "✅ Pipeline succeeded! Build #${env.BUILD_NUMBER} completed successfully."
        }
        failure {
            echo "❌ Pipeline failed! Please inspect logs for Build #${env.BUILD_NUMBER}."
        }
    }
}
