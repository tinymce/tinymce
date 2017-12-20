def credentialsId = '8aa93893-84cc-45fc-a029-a42f21197bb3';

properties([
  disableConcurrentBuilds(),
  pipelineTriggers([
    upstream(threshold: 'SUCCESS', upstreamProjects:
      // This list should match package.json
      'katamari, sand'
    ),
    pollSCM('H 0 1 1 1')
  ])
])

// Script to use for pipeline
node ("primary") {

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
    def permutation = permutations.get(i)
    processes[permutation.name] = {
      node("bedrock-" + permutation.os) {
          
        echo "Slave checkout"
        git([branch: "master", url:'ssh://git@stash:7999/van/agar.git', credentialsId: credentialsId])  
        
        echo "Fetching Slave Dependencies"
        extNpmInstall ()
        
        echo "Browser Tests for " + permutation.name
        def webdriverTests = permutation.browser == "firefox" ? "" : " src/test/ts/webdriver"
        extBedrock(permutation.name, permutation.browser, "src/test/ts/browser" + webdriverTests)
      }
    }
  }

  runTests = { 
    parallel processes
  }

  def runBuild = load("jenkins-plumbing/standard-build.groovy")
  runBuild(runTests)
}
