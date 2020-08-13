pipeline {
  agent {
    docker {
      image 'node:12-slim'
    }

  }
  stages {
    stage('Test') {
      parallel {
        stage('Lint') {
          steps {
            sh 'npm install'
            sh 'npm run lint'
          }
        }

        stage('Test') {
          steps {
            sh 'npm install'
            sh 'npm test'
          }
        }

      }
    }

    stage('NPM Audit') {
      parallel {
        stage('NPM Audit') {
          steps {
            sh 'npm audit --audit-level critical'
          }
        }

        stage('MicroScanner') {
          agent {
            docker {
              image 'alpine:latest'
            }

          }
          steps {
            sh 'wget https://get.aquasec.com/microscanner'
            sh 'chmod +x /microscanner'
            sh '/microscanner $MICROSCANNER_TOKEN --continue-on-failure'
          }
        }

      }
    }

    stage('Confirm') {
      steps {
        echo 'Looks good to me'
      }
    }

  }
}