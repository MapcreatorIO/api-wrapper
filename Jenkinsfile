@Library('deployment') _
import org.mapcreator.Deploy

node('npm && grunt') {
	stage('checkout') {
		checkout scm
	}

	stage('build') {
		sh 'npm install'
		sh '$(npm bin)/eslint src'
		sh 'grunt production'
		sh 'rm -rf node_modules'
	}
}

// vim: set ft=groovy: