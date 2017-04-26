@Library('deployment') _
import org.mapcreator.Deploy

node('npm && grunt') {
	stage('checkout') {
		checkout scm
	}

	stage('build') {
		sh 'npm install'
		sh '$(npm bin)/eslint --no-color --max-warnings 5 src gruntfile.js'
		sh 'grunt production'
		sh 'rm -rf node_modules'
	}
}

// vim: set ft=groovy: