@Library('deployment') _
import org.mapcreator.Deploy

node('npm && yarn') {
	stage('checkout') {
		checkout scm
	}

	stage('initialize') {
		sh 'yarn --no-emoji --non-interactive --no-progress'
		sh 'rm -r dist docs || true'
	}

	stage('linter') {
	 	sh '$(yarn bin)/eslint --no-color --max-warnings 5 --format checkstyle --output-file build/checkstyle.xml src'
	 	checkstyle pattern: 'build/checkstyle.xml'
	}

	stage('build') {
		sh '$(yarn bin)/webpack'
	}

	stage('archive') {
		archiveArtifacts artifacts: 'dist/*', fingerprint: true
	}

	stage('cleanup') {
		sh 'rm -rf node_modules dist docs build || true'
	}
}

// vim: set ft=groovy: