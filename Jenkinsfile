@Library('deployment') _
import org.mapcreator.Deploy

node('npm') {
	stage('checkout') {
		checkout scm
	}

	stage('initialize') {
		sh 'yarn --no-emoji --non-interactive --no-progress'
		sh 'rm -r dist docs || true'
	}

	stage('linter') {
	 	sh '$(yarn bin)/eslint --no-color --max-warnings 5 src'
	}

	stage('build') {
		sh '$(yarn bin)/webpack'
	}

	stage('archive') {
		archiveArtifacts artifacts: 'dist/*', fingerprint: true
	}

	stage('cleanup') {
		sh 'rm -rf node_modules dist docs || true'
	}
}

// vim: set ft=groovy: