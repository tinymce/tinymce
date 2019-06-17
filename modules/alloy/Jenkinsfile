properties([
  disableConcurrentBuilds(),
  pipelineTriggers([
    upstream(threshold: 'SUCCESS', upstreamProjects:
      // This list should match package.json
      'katamari, sugar, sand, boulder'
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
  stage "Skipping browser tests ... not yet working"
  def runBuild = load("jenkins-plumbing/standard-build.groovy")
  runBuild()


  /*
  def extBedrock = load("jenkins-plumbing/bedrock-tests.groovy")
  def exec = load("jenkins-plumbing/exec.groovy")

  def permutations = [:]

  permutations = [
    [ name: "win10Chrome", os: "windows-10", browser: "chrome" ],
    [ name: "win10FF", os: "windows-10", browser: "firefox" ],
    [ name: "win10Edge", os: "windows-10", browser: "MicrosoftEdge" ],
    [ name: "win10IE", os: "windows-10", browser: "ie" ]
  ]

  def processes = [:]


  for (int i = 0; i < permutations.size(); i++) {
    def permutation = permutations.get(i);
    def name = permutation.name;
    processes[permutation.name] = {
      node("bedrock-" + permutation.os) {
        echo "Platform: checkout"
        git([branch: "master", url:'ssh://git@stash:7999/van/alloy.git', credentialsId: credentialsId])

        echo "Platform: dependencies"
        exec "dent"

        echo "Platform: browser tests for " + permutation.name
        extBedrock(permutation.name, permutation.browser, "src/test/js/browser")
      }
    }
  }

  stage "Browser Tests"
  parallel processes

  */

}


