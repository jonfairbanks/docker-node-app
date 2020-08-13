pipeline {
  agent {
    docker {
      image 'node:12-slim'
      args '-p 3000:3000'
    }

  }
  stages {
    stage('Test') {
      steps {
        sh 'npm install'
        sh 'eslint .'
        sh 'npm test'
      }
    }

    stage('Audit') {
      steps {
        sh 'npm audit --audit-level critical'
      }
    }

  }
}