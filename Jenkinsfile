properties([
  disableConcurrentBuilds(),
  pipelineTriggers([
    upstream(threshold: 'SUCCESS', upstreamProjects:
      // This list should match package.json
      'alloy, bridge'
    ),
    pollSCM('H 0 1 1 1')
  ])
])

node("primary") {
  stage ("Checkout SCM") {
    checkout scm
    sh "mkdir -p jenkins-plumbing"
    dir ("jenkins-plumbing") {
      git([branch: "tinymce-5.x", url:'ssh://git@stash:7999/van/jenkins-plumbing.git', credentialsId: '8aa93893-84cc-45fc-a029-a42f21197bb3'])
    }
  }

  def extNpmInstall = load("jenkins-plumbing/npm-install.groovy")

  def permutations = [
     [ name: "win10Chrome", os: "windows-10", browser: "chrome" ]
    ,[ name: "win10FF", os: "windows-10", browser: "firefox" ]
    ,[ name: "win10Edge", os: "windows-10", browser: "MicrosoftEdge" ]
    ,[ name: "win10IE", os: "windows-10", browser: "ie" ]
    ,[ name: "macSafari", os: "macos", browser: "safari" ]
    ,[ name: "macChrome", os: "macos", browser: "chrome" ]
    ,[ name: "macFirefox", os: "macos", browser: "firefox" ]
  ]

  def processes = [:]

  for (int i = 0; i < permutations.size(); i++) {
    def permutation = permutations.get(i);
    def processName = permutation.name;
    processes[processName] = {
      stage (permutation.os + ' ' + permutation.browser) {
        node("bedrock-" + permutation.os) {
          echo "Slave checkout on node $NODE_NAME"
          checkout scm

          // never trust node to know what it's doing
          // dir('node_modules') {
          //  deleteDir()
          // }

          echo "Installing tools"
          extNpmInstall()
          if (isUnix()) {
            sh "yarn grunt dev"
          } else {
            bat "yarn grunt dev"
          }


          echo "Platform: browser tests for " + permutation.name + " on node: $NODE_NAME"

          // individual test timeout - 50 seconds. Ideally would only be 30 but resample URL tends to take a while, as do tests that run all languages
          def singleTimeout ="50000"

          // overall timeout - was 780 seconds (13m) , trying 1200s (20m) for the slow VMs
          // -system and -acceptance tests are sometimes taking >16m (Aug '17)
          def totalTimeout="1200000"

          def customParams = '--totalTimeout ' + totalTimeout + ' --singleTimeout ' + singleTimeout + ' --stopOnFailure'

          def name = permutation.name

          // Clean out the old XML files before running tests, since we junit import *.XML files
          dir('scratch') {
            if (isUnix()) {
              sh "rm -f *.xml"
            } else {
              bat "del *.xml"
            }
          }


          def bedrock = "yarn grunt bedrock-auto:standard --bedrock-browser=" + permutation.browser

          def successfulTests = true

          if (isUnix()) {
            successfulTests = (sh([script: bedrock, returnStatus: true]) == 0) && successfulTests
          } else {
            successfulTests = (bat([script: bedrock, returnStatus: true]) == 0) && successfulTests
          }

          echo "Writing JUnit results for " + name + " on node: $NODE_NAME"

          step([$class: 'JUnitResultArchiver', testResults: 'scratch/TEST-*.xml'])

          if (!successfulTests) {
            echo "Tests failed for " + name + " so passing failure as exit code for node: $NODE_NAME"
            if (isUnix()) {
              sh "exit 1"
            } else {
              bat "exit 1"
            }
          }
        }
      }
    }
  }

  def runTests = {
    parallel processes
  }

  def runBuild = load("jenkins-plumbing/standard-build.groovy")

  extNpmInstall()

  // build only runs on linux
  stage ("Type check") {
    sh 'grunt shell:tsc tslint'
  }
  runBuild(runTests, "5.x", "prerelease")
}