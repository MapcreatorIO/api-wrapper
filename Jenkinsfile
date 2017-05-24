@Library('deployment') _
import org.mapcreator.Deploy

def git_push(branch) {
	withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: '7bdf0a8c-d1c2-44a4-8644-a4677f0662aa', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD']]) {
		sh "git push -u https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/MapCreatorEU/m4n-api.git ${branch}"
	}
}

def git_push_tags(branch) {
	withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: '7bdf0a8c-d1c2-44a4-8644-a4677f0662aa', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD']]) {
		sh "git push -u https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/MapCreatorEU/m4n-api.git ${branch} --tags"
	}
}

node('npm && yarn') {
	if (!isUnix()) {
		error 'Only compatible with UNIX systems.'
	}

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

	SHOULD_TAG = BRANCH_NAME in ['master', 'develop'] && sh(script: 'git describe --exact-match --tag HEAD', returnStatus: true) != 0

	if (SHOULD_TAG) {
		stage('tag') {

			if (SHOULD_TAG) {
				if (BRANCH_NAME == 'master') {
					sh 'npm version minor -m "Auto upgrade to minor %s" || true'
				}

				if (BRANCH_NAME == 'develop') {
					sh 'npm version patch -m "Auto upgrade to patch %s" || true'
				}

				git_push_tags "HEAD:${BRANCH_NAME}"
			}
		}

		stage('publish') {
			withCredentials([file(credentialsId: '10faaf42-30f6-412b-b53c-ab6f063ea9cd', variable: 'FILE')]) {
				sh 'cp ${FILE} .npmrc'

				sh 'npm publish --access=public || echo "Failed upload, skipping..."'

				sh 'rm -v .npmrc'
			}
		}

		stage('docs') {
			sh '$(yarn bin)/esdoc'

			sh 'mv -v dist docs/'
			sh 'rm -rf $(ls -a | grep -ve docs -e .git -e .gitignore) || true'

			sh 'git checkout gh-pages'

			sh 'rm -rf $(ls -a | grep -ve docs -e .git -e .gitignore) || true'
			sh 'mv docs/* ./'
			sh 'rm -r docs'

			sash 'touch .nojekyll'

			sh 'git config --global user.email "noreply@mapcreator.eu"'
			sh 'git config --global user.name Jenkins'
			sh 'git add .'
			sh 'git status'

			sh 'git commit -m "Update auto generated docs"'

			git_push 'gh-pages'
		}
	}

	stage('cleanup') {
		sh 'rm -rf node_modules dist docs build || true'
	}
}

// vim: set ft=groovy:
