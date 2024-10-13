#!/usr/bin/env groovy

pipeline {
  agent any

  tools {
    nodejs 'NpxNodeJS'
  }

    stage('Build Dockerfile') {
      steps {
        script {
          nodejs(nodeJSInstallationName: 'NpxNodeJS') {
            docker.build('omeglestr:latest')
          }
        }
      }
    }

    stage('Publish') {
      steps {
        script {
          ws("workspace") {
            docker.withRegistry('https://ra9.local:5000', 'ra9-registry-credentials') {
              docker.image('omeglestr:latest').push()
            }
          }
        }
      }
    }
  }
}