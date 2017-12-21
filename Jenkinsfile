properties([
  disableConcurrentBuilds(),
  pipelineTriggers([
    upstream(threshold: 'SUCCESS', upstreamProjects:
      // This list should match package.json
      'katamari, dragster, echo, porkbun, robin, sugar, sand'
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

  def extNpmInstall = load("jenkins-plumbing/npm-install.groovy")
  def extBedrock = load("jenkins-plumbing/bedrock-tests.groovy")

  def permutations = [
    [ name: "win10Chrome", os: "windows-10", browser: "chrome" ],
    [ name: "win10FF", os: "windows-10", browser: "firefox" ],
    [ name: "win10Edge", os: "windows-10", browser: "MicrosoftEdge" ],
    [ name: "win10IE", os: "windows-10", browser: "ie" ]
  ]

  def processes = [:]

  for (int i = 0; i < permutations.size(); i++) {
    def permutation = permutations.get(i);
    def name = permutation.name;
    processes[name] = {
      node("bedrock-" + permutation.os) {
        echo "Slave checkout"
        git([branch: "master", url:'ssh://git@stash:7999/tbio/snooker.git', credentialsId: '8aa93893-84cc-45fc-a029-a42f21197bb3'])

        sshagent(credentials: ['8aa93893-84cc-45fc-a029-a42f21197bb3']) {
          echo "Installing tools"
          extNpmInstall()

          echo "Platform: browser tests for " + permutation.name
          extBedrock(permutation.name, permutation.browser, "src/test/ts/browser")
        }
      }
    }
  }

  runTests = {
    parallel processes
  }

  def runBuild = load("jenkins-plumbing/standard-build.groovy")
  runBuild(runTests)

}