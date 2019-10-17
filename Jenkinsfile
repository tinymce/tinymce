def runTests(extExecHandle, name, bedrockCommand) {
  // Clean out the old XML files before running tests, since we junit import *.XML files
  dir('scratch') {
    if (isUnix()) {
      sh "rm -f *.xml"
    } else {
      bat "del *.xml"
    }
  }

  def successfulTests = extExecHandle(bedrockCommand)

  echo "Writing JUnit results for " + name + " on node: $NODE_NAME"
  junit allowEmptyResults: true, testResults: 'scratch/TEST-*.xml'

  if (!successfulTests) {
    echo "Tests failed for " + name + " so passing failure as exit code for node: $NODE_NAME"
    sh "exit 1"
  }
}

def runBrowserTests(extExecHandle, name, browser, os, bucket, buckets) {
  def bedrockCommand =
    "yarn grunt browser-auto" +
      " --bedrock-os=" + os +
      " --bedrock-browser=" + browser +
      " --bucket=" + bucket +
      " --buckets=" + buckets;

  runTests(extExecHandle, name, bedrockCommand);
}

def runPhantomTests(extExecHandle) {
  def bedrockCommand = "yarn grunt phantomjs-auto";
  runTests(extExecHandle, "PhantomJS", bedrockCommand);
}

properties([
  disableConcurrentBuilds(),
  pipelineTriggers([]),
  buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '1', daysToKeepStr: '', numToKeepStr: ''))
])

node("primary") {
  timestamps {
    def extExec, extExecHandle, extYarnInstall, grunt

    def gitMerge = {
      if (BRANCH_NAME != "master") {
        echo "Merging master into this branch to run tests"
        extExec("git merge --no-commit --no-ff origin/master")
      }
    }

    stage ("Checkout SCM") {
      checkout scm
      fileLoader.withGit("ssh://git@stash:7999/van/jenkins-plumbing.git", "master", "8aa93893-84cc-45fc-a029-a42f21197bb3", '') {
        extExec = fileLoader.load("exec")
        extExecHandle = fileLoader.load("execHandle")
        extYarnInstall = fileLoader.load("npm-install")
        grunt = fileLoader.load("grunt")
      }
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
      extExec "git clean -fdx modules"
      extYarnInstall()
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
              extExec("git config user.email \"local@build.node\"")
              extExec("git config user.name \"irrelevant\"")

              gitMerge()

              cleanAndInstall()
              extExec "yarn ci"

              echo "Platform: browser tests for " + permutation.name + " on node: $NODE_NAME"
              runBrowserTests(extExecHandle, permutation.name, permutation.browser, permutation.os, c_bucket, buckets)
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
        runPhantomTests(extExecHandle)
      }

      if (BRANCH_NAME != "master") {
        stage ("Archive Build") {
          extExec("yarn tinymce-grunt prodBuild symlink:js")
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
        extExec "yarn ci-all"
      }

      stage ("Run Tests") {
        grunt "list-changed-phantom list-changed-browser"
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
