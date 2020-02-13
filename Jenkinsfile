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

def runBrowserTests(name, browser, os, bucket, buckets) {
  def bedrockCommand =
    "yarn grunt browser-auto" +
      " --bedrock-os=" + os +
      " --bedrock-browser=" + browser +
      " --bucket=" + bucket +
      " --buckets=" + buckets;

  runTests(name, bedrockCommand);
}

def runPhantomTests() {
  def bedrockCommand = "yarn grunt phantomjs-auto";
  runTests("PhantomJS", bedrockCommand);
}

standardProperties()

node("primary") {
  timestamps {
    def primaryBranch = "master"

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
      [ name: "win10Chrome", os: "windows-10", browser: "chrome", buckets: 1 ],
      [ name: "win10FF", os: "windows-10", browser: "firefox", buckets: 1 ],
      [ name: "win10Edge", os: "windows-10", browser: "MicrosoftEdge", buckets: 2 ],
      [ name: "win10IE", os: "windows-10", browser: "ie", buckets: 3 ],
      [ name: "macSafari", os: "macos", browser: "safari", buckets: 1 ],
      [ name: "macChrome", os: "macos", browser: "chrome", buckets: 1 ],
      [ name: "macFirefox", os: "macos", browser: "firefox", buckets: 1 ]
    ]

    def cleanAndInstall = {
      echo "Installing tools"
      exec("git clean -fdx modules")
      yarnInstall()
    }

    def processes = [:]

    // Browser tests
    for (int i = 0; i < browserPermutations.size(); i++) {
      def permutation = browserPermutations.get(i)

      def buckets = permutation.buckets
      for (int bucket = 1; bucket <= buckets; bucket++) {
        def suffix = buckets == 1 ? "" : "-" + bucket

        // closure variable - don't inline
        def c_bucket = bucket

        processes[permutation.name + suffix] = {
          stage (permutation.os + " " + permutation.browser + suffix) {
            node("bedrock-" + permutation.os) {
              echo "name: " + permutation.name + " bucket: " + c_bucket + "/" + buckets
              echo "Node checkout on node $NODE_NAME"
              checkout scm

              // windows tends to not have username or email set
              exec("git config user.email \"local@build.node\"")
              exec("git config user.name \"irrelevant\"")

              gitMerge()

              cleanAndInstall()
              exec("yarn ci")

              echo "Platform: browser tests for " + permutation.name + " on node: $NODE_NAME"
              runBrowserTests(permutation.name, permutation.browser, permutation.os, c_bucket, buckets)
            }
          }
        }
      }
    }

    processes["phantom-and-archive"] = {
      stage ("PhantomJS") {
        // PhantomJS is a browser, but runs on the same node as the pipeline
        // we are re-using the state prepared by `ci-all` below
        // if we ever change these tests to run on a different node, rollup is required in addition to the normal CI command
        echo "Platform: PhantomJS tests on node: $NODE_NAME"
        runPhantomTests()
      }

      if (BRANCH_NAME != primaryBranch) {
        stage ("Archive Build") {
          exec("yarn tinymce-grunt prodBuild symlink:js")
          archiveArtifacts artifacts: 'js/**', onlyIfSuccessful: true
        }
      }
    }

    // No actual code runs between SCM checkout and here, just function definition
    notifyBitbucket()
    try {
      // our linux nodes have multiple executors, sometimes yarn creates conflicts
      lock("Don't run yarn simultaneously") {
        stage ("Install tools") {
          cleanAndInstall()
        }
      }

      stage ("Type check") {
        exec("yarn ci-all")
      }

      stage ("Run Tests") {
        grunt("list-changed-phantom list-changed-browser")
        // Run all the tests in parallel
        parallel processes
      }

      // bitbucket plugin requires the result to explicitly be success
      if (currentBuild.resultIsBetterOrEqualTo("SUCCESS")) {
        currentBuild.result = "SUCCESS"
      }
    } catch (err) {
      currentBuild.result = "FAILED"
    }
    notifyBitbucket()
  }
}
