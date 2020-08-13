pipeline {
  agent {
    docker {
      image 'node:12-slim'
    }

  }
  stages {
    stage('Test') {
      parallel {
        stage('Install') {
          steps {
            sh 'npm install'
          }
        }

        stage('Lint') {
          steps {
            sh 'npm run lint'
          }
        }

        stage('Test') {
          steps {
            sh 'npm test'
          }
        }

      }
    }

    stage('Audit') {
      parallel {
        stage('Audit') {
          steps {
            echo 'Running Code Audit'
          }
        }

        stage('NPM Audit') {
          steps {
            sh 'npm audit --audit-level critical'
          }
        }

      }
    }

    stage('') {
      steps {
        echo 'Looks good to me'
      }
    }

  }
}