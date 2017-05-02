@Library('deployment') _
import org.mapcreator.Deploy

node('npm') {
	stage('checkout') {
		checkout scm
	}

	stage('initialize') {
		sh 'yarn --no-emoji --non-interactive --no-progress'
	}

	stage('linter') {
	 	sh '$(yarn bin)/eslint --no-color --max-warnings 5 src'
	}

	stage('build') {
		parallel buildDev: {
			sh '$(yarn bin)/webpack'
		}, buildProd: {
			sh '$(yarn bin)/webpack -p --output-filename bundle.min.js'
		}

		archiveArtifacts artifacts: 'dist/*', fingerprint: true
	}

	stage('cleanup') {
		sh 'rm -rf node_modules'
	}
}

// vim: set ft=groovy: