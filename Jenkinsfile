@Library('deployment') _
import org.mapcreator.Deploy

def git_push(branch, args) {
  withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: '7bdf0a8c-d1c2-44a4-8644-a4677f0662aa', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD']]) {
    sh "git push -u https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/MapCreatorEU/api-wrapper.git ${branch} ${args}"
  }
}

node('npm') {
  if (!isUnix()) {
    error 'Only compatible with UNIX systems.'
  }

  stage('checkout') {
    checkout scm
    sh 'git fetch --tags'
  }

  stage('initialize') {
    sh 'npm ci'
    sh 'rm -r dist docs .env || true'
    sh 'git checkout -- "*"'
  }

  SHOULD_TAG = BRANCH_NAME in ['master', 'develop'] && sh(script: 'git describe --exact-match --tag HEAD', returnStatus: true) != 0

  if (SHOULD_TAG) {
    stage('tag') {
      VERSION_LOG = sh(returnStdout: true, script: 'git log --no-merges --format=oneline $(git describe --abbrev=0 --tags)...HEAD | sed s/[a-z0-9]\\*\\ /\\ -\\ /')

      if (BRANCH_NAME == 'master') {
        sh "npm version minor -m \"Auto upgrade to minor %s\n\n${VERSION_LOG}\" || true"
      }

      if (BRANCH_NAME == 'develop') {
        sh "npm version patch -m \"Auto upgrade to patch %s\n\n${VERSION_LOG}\" || true"
      }
    }
  }

  parallel lint: {
    stage('linter') {
      sh 'npm run lint'
      checkstyle pattern: 'build/checkstyle.xml'
    }
  }, build {
    stage('build') {
        sh 'npm run build'
        archiveArtifacts artifacts: 'dist/*', fingerprint: true
      }
  }, failFast: true

  parallel test: {
    stage('test') {
      timeout(activity: true, time: 2) {
        sh 'npm run test-ci'
      }

      publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: true, reportDir: 'build/coverage/', reportFiles: 'index.html', reportName: 'NYC Coverage', reportTitles: ''])
      step([$class: 'CoberturaPublisher', autoUpdateHealth: false, autoUpdateStability: false, coberturaReportFile: 'build/coverage/cobertura-coverage.xml', failUnhealthy: false, failUnstable: false, maxNumberOfBuilds: 100, onlyStable: false, sourceEncoding: 'ASCII', zoomCoverageChart: false])
      junit 'build/junit.xml'
    }
  }, docs: {
    stage('docs') {
      sh 'npm run docs'

      if (SHOULD_TAG) {
        sh './scripts/docs-commit.sh'
        git_push('gh-pages', '--force')
      }
    }
  }, failFast: true

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

  stage('cleanup') {
    sh 'rm -rf node_modules dist docs build .env || true'
  }
}

// vim: set ft=groovy:
