#!groovy
@Library('waluigi@release/7') _

standardProperties()

def runTests(String name, String bedrockCommand, Boolean runAll) {
  // Clean out the old XML files before running tests, since we junit import *.XML files
  dir('scratch') {
    if (isUnix()) {
      sh "rm -f *.xml"
    } else {
      bat "del *.xml"
    }
  }

  def command = runAll ? bedrockCommand + ' --ignore-lerna-changed=true' : bedrockCommand
  def testStatus = exec(script: command, returnStatus: true)

  echo "Writing JUnit results for ${name} on node: $NODE_NAME"
  junit allowEmptyResults: true, testResults: 'scratch/TEST-*.xml'

  // If the tests failed (exit code 4) then just mark it as unstable
  if (testStatus == 4) {
    unstable("Tests failed for ${name}")
  } else if (testStatus != 0) {
    error("Unexpected error running tests for ${name} so passing failure as exit code")
  }
}

def runBrowserTests(String name, String browser, String os, Integer bucket, Integer buckets, Boolean runAll) {
  def bedrockCommand =
    "yarn grunt browser-auto" +
      " --chunk=400" +
      " --bedrock-os=" + os +
      " --bedrock-browser=" + browser +
      " --bucket=" + bucket +
      " --buckets=" + buckets;

  runTests(name, bedrockCommand, runAll);
}

def runHeadlessTests(Boolean runAll) {
  def bedrockCommand = "yarn grunt headless-auto";
  runTests("chrome-headless", bedrockCommand, runAll);
}

def gitMerge(String primaryBranch) {
  if (env.BRANCH_NAME != primaryBranch) {
    echo "Merging ${primaryBranch} into this branch to run tests"
    exec("git merge --no-commit --no-ff origin/${primaryBranch}")
  }
}

node("headless-macos") {
  timestamps {
    checkout scm

    def props = readProperties file: 'build.properties'

    def primaryBranch = props.primaryBranch
    assert primaryBranch != null && primaryBranch != ""
    def runAllTests = env.BRANCH_NAME == primaryBranch

    stage("Merge") {
      // cancel build if primary branch doesn't merge cleanly
      gitMerge(primaryBranch)
    }

    def platforms = [
      [ os: "windows", browser: "chrome" ],
      [ os: "windows", browser: "firefox" ],
      [ os: "windows", browser: "MicrosoftEdge" ],
      [ os: "macos", browser: "safari" ],
      [ os: "macos", browser: "chrome" ],
      [ os: "macos", browser: "firefox" ]
    ]

    def cleanAndInstall = {
      echo "Installing tools"
      exec("git clean -fdx modules scratch js dist")
      yarnInstall()
    }

    def processes = [:]

    // Browser tests
    for (int i = 0; i < platforms.size(); i++) {
      def platform = platforms.get(i)

      def buckets = platform.buckets ?: 1
      for (int bucket = 1; bucket <= buckets; bucket++) {
        def suffix = buckets == 1 ? "" : "-" + bucket

        // closure variable - don't inline
        def c_bucket = bucket

        def name = "${platform.os}-${platform.browser}${suffix}"

        processes[name] = {
          stage(name) {
            node("bedrock-${platform.os}") {
              echo("Bedrock tests for ${name}")

              echo("Checking out code on build node: $NODE_NAME")
              checkout(scm)

              // windows tends to not have username or email set
              tinyGit.addAuthorConfig()
              gitMerge(primaryBranch)

              cleanAndInstall()
              exec("yarn ci")

              echo("Running browser tests")
              runBrowserTests(name, platform.browser, platform.os, c_bucket, buckets, runAllTests)
            }
          }
        }
      }
    }

    processes["headless-and-archive"] = {
      stage("headless tests") {
        // Prevent multiple headless tests running at once
        lock("headless tests") {
          // chrome-headless tests run on the same node as the pipeline
          // we are re-using the state prepared by `ci-all` below
          // if we ever change these tests to run on a different node, rollup is required in addition to the normal CI command
          echo "Platform: chrome-headless tests on node: $NODE_NAME"
          runHeadlessTests(runAllTests)
        }
      }

      if (env.BRANCH_NAME != primaryBranch) {
        stage("Archive Build") {
          exec("yarn tinymce-grunt prodBuild symlink:js")
          archiveArtifacts artifacts: 'js/**', onlyIfSuccessful: true
        }
      }
    }

    // our linux nodes have multiple executors, sometimes yarn creates conflicts
    lock("Don't run yarn simultaneously") {
      stage("Install tools") {
        cleanAndInstall()
      }
    }

    stage("Type check") {
      exec("yarn ci-all")
    }

    stage("Moxiedoc check") {
      exec("yarn tinymce-grunt shell:moxiedoc")
    }

    stage("Run Tests") {
      grunt("list-changed-headless list-changed-browser")
      // Run all the tests in parallel
      parallel processes
    }
  }
}
