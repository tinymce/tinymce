properties([
  disableConcurrentBuilds(),
  pipelineTriggers([
    upstream(threshold: 'SUCCESS', upstreamProjects:
      // This list should match package.json
      'katamari,sugar'
    ),
    pollSCM('H 0 1 1 1')
  ])
])

node("primary") {
  stage ("Checkout SCM") {
    checkout scm
    sh "mkdir -p jenkins-plumbing"
    dir ("jenkins-plumbing") {
      git([branch: "master", url:'ssh://git@stash:7999/van/jenkins-plumbing.git', credentialsId: '8aa93893-84cc-45fc-a029-a42f21197bb3'])
    }
  }
  def runBuild = load("jenkins-plumbing/standard-build.groovy")
  runBuild()
}