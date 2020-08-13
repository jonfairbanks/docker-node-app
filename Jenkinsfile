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
          steps {
            sh 'apt-get install curl'
            sh 'curl https://get.aquasec.com/microscanner --output /microscanner'
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