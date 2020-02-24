#!groovy
@Library('waluigi@v3.1.0') _

def runTests(name, bedrockCommand) {
  // Clean out the old XML files before running tests, since we junit import *.XML files
  dir('scratch') {
    if (isUnix()) {
      sh "rm -f *.xml"
    } else {
      bat "del *.xml"
    }
  }

  def successfulTests = execHandle(bedrockCommand)

  echo "Writing JUnit results for " + name + " on node: $NODE_NAME"
  junit allowEmptyResults: true, testResults: 'scratch/TEST-*.xml'

  if (!successfulTests) {
    echo "Tests failed for " + name + " so passing failure as exit code for node: $NODE_NAME"
    sh "exit 1"
  }
}

def runBrowserTests(name, browser) {
  def bedrockCommand = "yarn grunt bedrock-auto:" + browser
  runTests(name, bedrockCommand);
}

standardProperties()

node("primary") {
  timestamps {
    def primaryBranch = "4.x"

    def gitMerge = {
      if (BRANCH_NAME != primaryBranch) {
        echo "Merging ${primaryBranch} into this branch to run tests"
        exec("git merge --no-commit --no-ff origin/${primaryBranch}")
      }
    }

    stage ("Checkout SCM") {
      checkout scm
      // cancel build if master doesn't merge cleanly, otherwise tests wil fail
      gitMerge()
    }

    def browserPermutations = [
      [ name: "win10Chrome", os: "windows-10", browser: "chrome" ],
      [ name: "win10FF", os: "windows-10", browser: "firefox" ],
      [ name: "win10Edge", os: "windows-10", browser: "MicrosoftEdge" ],
      [ name: "win10IE", os: "windows-10", browser: "ie" ]
    ]

    def cleanAndInstall = {
      echo "Installing tools"
      exec("git clean -fdx --exclude=node_modules")
      yarnInstall()
    }

    def processes = [:]

    // Browser tests
    for (int i = 0; i < browserPermutations.size(); i++) {
      def permutation = browserPermutations.get(i)
      processes[permutation.name] = {
        stage (permutation.os + " " + permutation.browser) {
          node("bedrock-" + permutation.os) {
            echo "name: " + permutation.name
            echo "Node checkout on node $NODE_NAME"
            checkout scm

            // windows tends to not have username or email set
            exec("git config user.email \"local@build.node\"")
            exec("git config user.name \"irrelevant\"")

            gitMerge()

            cleanAndInstall()
            grunt("dev")

            echo "Platform: browser tests for " + permutation.name + " on node: $NODE_NAME"
            runBrowserTests(permutation.name, permutation.browser)
          }
        }
      }
    }

    // our linux nodes have multiple executors, sometimes yarn creates conflicts
    lock("Don't run yarn simultaneously") {
      stage ("Install tools") {
        cleanAndInstall()
      }
    }

    stage ("Type check") {
      grunt("dev")
      exec("yarn lint")
    }

    stage ("Run Tests") {
      // Run all the tests in parallel
      parallel processes
    }
  }
}
