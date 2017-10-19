@Library('deployment') _
import org.mapcreator.Deploy

def git_push(branch, args) {
	withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: '7bdf0a8c-d1c2-44a4-8644-a4677f0662aa', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD']]) {
		sh "git push -u https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/MapCreatorEU/m4n-api.git ${branch} ${args}"
	}
}

node('npm && yarn') {
	if (!isUnix()) {
		error 'Only compatible with UNIX systems.'
	}

	stage('checkout') {
		checkout scm
		sh 'git fetch --tags'
	}

	stage('initialize') {
		sh 'yarn --no-emoji --non-interactive --no-progress'
		sh 'rm -r dist docs .env || true'
    sh 'git checkout -- "*"'
	}

	stage('linter') {
		sh 'yarn run lint'
		checkstyle pattern: 'build/checkstyle.xml'
	}

	SHOULD_TAG = BRANCH_NAME in ['master', 'develop'] && sh(script: 'git describe --exact-match --tag HEAD', returnStatus: true) != 0

	stage('tag') {
		if (SHOULD_TAG) {
			sh 'yarn run authors'
			sh 'git add AUTHORS.md'
			sh 'git commit -m "Update AUTHORS.md" || true'

			if (BRANCH_NAME == 'master') {
			sh 'npm version minor -m "Auto upgrade to minor %s" || true'
			}

			if (BRANCH_NAME == 'develop') {
			sh 'npm version patch -m "Auto upgrade to patch %s" || true'
			}
		}
	}

	stage('build') {
		sh 'yarn run build'
		archiveArtifacts artifacts: 'dist/*', fingerprint: true
	}

	stage('test') {
    sh 'yarn run test-ci'
    publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: true, reportDir: 'build/coverage/', reportFiles: 'index.html', reportName: 'NYC Coverage', reportTitles: ''])
    step([$class: 'CoberturaPublisher', autoUpdateHealth: false, autoUpdateStability: false, coberturaReportFile: 'build/coverage/cobertura-coverage.xml', failUnhealthy: false, failUnstable: false, maxNumberOfBuilds: 100, onlyStable: false, sourceEncoding: 'ASCII', zoomCoverageChart: false])
    step([$class: "TapPublisher", testResults: "build/ava.tap"])
	}

	stage('publish') {
		if (SHOULD_TAG) {
			git_push("HEAD:${BRANCH_NAME}", '--tags')

			withCredentials([file(credentialsId: '10faaf42-30f6-412b-b53c-ab6f063ea9cd', variable: 'FILE')]) {
				sh 'cp ${FILE} .npmrc'

				sh 'npm publish --access=public || echo "Failed upload, skipping..."'

				sh 'rm -v .npmrc'
			}

			PACKAGE_VERSION = sh(returnStdout: true, script: 'git describe --exact-match --tag HEAD 2>/dev/null || git rev-parse --short HEAD').trim()
			println "Published package version ${PACKAGE_VERSION}"

			slackSend(color: 'good', message: "`@mapcreator/maps4news` version ${PACKAGE_VERSION} was just published, please run `npm install @mapcreator/maps4news${PACKAGE_VERSION.replace('v', '@')}`.", channel: '#api')
		}
	}

	stage('docs') {
		sh 'yarn run docs'

		if (SHOULD_TAG) {
			sh 'mv -v dist docs'
			sh 'rm -rf $(ls -a | grep -ve docs -e .git -e .gitignore) || true'

			sh 'git checkout gh-pages'
			sh 'rm -rf $(ls -a | grep -ve docs -e .git -e .gitignore) || true'
			sh 'mv docs/* ./'
			sh 'rm -r docs'

			sh 'touch .nojekyll'

			sh 'git config --global user.email "noreply@mapcreator.eu"'
			sh 'git config --global user.name Jenkins'
			sh 'git add .'
			sh 'git status'

			sh 'git commit -m "Update auto generated docs"'

			git_push('gh-pages', '--force')
		}
	}

	stage('cleanup') {
		sh 'rm -rf node_modules dist docs build .env || true'
	}
}

// vim: set ft=groovy:
