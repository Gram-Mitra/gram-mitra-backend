def executeCmd(String cmd) {
    if (isUnix()) {
        sh cmd
    } else {
        bat cmd
    }
}

pipeline {
    agent any

    environment {
        APP_NAME = 'gram-mitra-backend'
        IMAGE_TAG = "${env.BUILD_NUMBER ?: 'dev'}"
        DOCKER_REGISTRY = 'ak3806'
        DOCKER_CREDENTIALS_ID = 'docker-registry-credentials'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    triggers {
        pollSCM('* * * * *')
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
                script {
                    executeCmd('npm ci')
                }
            }
        }

        stage('Run Automated Tests') {
            steps {
                echo '=== Stage 3: Running automated unit and integration tests ==='
                script {
                    executeCmd('npm test')
                }
            }
        }

        stage('Code Quality (SonarQube)') {
            steps {
                echo '=== Stage 4: Code Quality Scan ==='
                script {
                    echo 'SonarQube analysis stage ready. (Uncomment sonar-scanner step once SonarQube server is configured).'
                    // executeCmd('sonar-scanner -Dsonar.projectName=gram-mitra-backend -Dsonar.projectKey=gram-mitra-backend')
                }
            }
        }

        stage('Security Vulnerability Scan (Trivy)') {
            steps {
                echo '=== Stage 5: Security Vulnerability Scan ==='
                script {
                    echo 'Trivy security scan stage ready. (Uncomment below once Trivy CLI is installed on runner).'
                    // executeCmd('trivy fs --severity HIGH,CRITICAL .')
                }
            }
        }

        stage('Docker Build') {
            steps {
                echo "=== Stage 6: Building Docker Image ${DOCKER_REGISTRY}/${APP_NAME}:${IMAGE_TAG} ==="
                script {
                    executeCmd("docker build -t ${DOCKER_REGISTRY}/${APP_NAME}:${IMAGE_TAG} -t ${DOCKER_REGISTRY}/${APP_NAME}:latest .")
                }
            }
        }

        stage('Docker Push') {
            steps {
                echo '=== Stage 7: Pushing Docker Image to Registry ==='
                script {
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        executeCmd("docker login -u ${DOCKER_USER} -p ${DOCKER_PASS}")
                        executeCmd("docker push --all-tags ${DOCKER_REGISTRY}/${APP_NAME}")
                    }
                }
            }
        }

        stage('Deploy Application') {
            steps {
                echo '=== Stage 8: Deploying Application Container ==='
                script {
                    executeCmd('docker compose up -d --build backend')
                }
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
