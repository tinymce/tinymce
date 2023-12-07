#!groovy
@Library('waluigi@release/7') _

def withRemoteCreds(String provider, Closure body) {
  if (provider == 'aws') {
    withAwsCreds {
      body()
    }
  }
  if (provider == 'lambdatest') {
    withLtCreds {
      body()
    }
  }
}

def withAwsCreds(Closure body) {
  tinyAws.withAWSWebIdentityToken {
    tinyAws.withAWSRoleARN('arn:aws:iam::103651136441:role/ci/build/tinymce_devicefarm') {
      body()
    }
  }
}

def withLtCreds(Closure body) {
  withCredentials([usernamePassword(credentialsId: 'lambda-engci', usernameVariable: 'LT_USERNAME', passwordVariable: 'LT_ACCESS_KEY')]) {
    body()
  }
}

def runBedrockTest(String command, Boolean runAll, int retry = 0, int timeout = 0) {
  def bedrockCmd = command + (runAll ? " --ignore-lerna-changed=true" : "")
  echo "Running Bedrock cmd: ${command}"
  def testStatus = sh(script: command, returnStatus: true)
  junit allowEmptyResults: true, testResults: 'scratch/TEST-*.xml'

  if (testStatus == 4) {
    unstable("Test failed")
  } else if (testStatus != 0) {
    if (retry > 0) {
      echo "Running retry [${retry}] after [${timeout}]"
      sleep(timeout)
      runBedrockTest(command, runAll, retry - 1)
    } else {
      error("Unexpected error")
    }
  }
}

def runHeadlessTests(Boolean runAll) {
  def bedrockCmd = "yarn grunt headless-auto"
  runBedrockTest(bedrockCmd, runAll)
}

def runRemoteTests(String name, String browser, String provider, String bucket, String buckets, Boolean runAll, int retry = 0, int timeout = 0) {
  def awsOpts = " --sishDomain=sish.osu.tiny.work --devicefarmArn=arn:aws:devicefarm:us-west-2:103651136441:testgrid-project:79ff2b40-fe26-440f-9539-53163c25442e"
  def bedrockCommand =
  "yarn browser-test" +
    " --chunk=50" +
    " --bedrock-browser=" + browser +
    " --remote=" + provider +
    " --bucket=" + bucket +
    " --buckets=" + buckets +
    " --name=" + name +
    "${provider == 'aws' ? awsOpts : ''}"
    runBedrockTest(bedrockCommand, runAll, retry, timeout)
}

def runTestPod(String name, String browser, String provider, String bucket, String buckets, Boolean runAll) {
  return {
    tinyPods.node([
      resourceRequestCpu: '6',
      resourceRequestMemory: '4Gi',
      resourceLimitCpu: '7.5',
      resourceLimitMemory: '4Gi'
    ]) {
      if (provider == 'aws') {
        stage('Tunnel') {
          echo 'Adding Tunnel'
          sh """
          echo "sish.osu.tiny.work ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKl0pmqRdhKQksLYj9k3FUVdrkD/GWXJ/YhHJ3KWRDvz" >> ~/.ssh/known_hosts
          """
        }
      }

      stage('Test') {
        yarnInstall()
        sh 'yarn ci'
        grunt('list-changed-browser')
        withRemoteCreds(provider) {
          int retry = provider == 'lambdatest' ? 3 : 0
          runRemoteTests(name, browser, provider, bucket, buckets, runAll, retry, 180)
        }
      }
    }
  }
}

def gitMerge(String primaryBranch) {
  if (env.BRANCH_NAME != primaryBranch) {
    echo "Merging ${primaryBranch} into this branch to run tests"
    exec("git merge --no-commit --no-ff origin/${primaryBranch}")
  }
}

def props

timestamps {
  tinyPods.node([
    resourceRequestCpu: '6',
    resourceRequestMemory: '4Gi',
    resourceLimitCpu: '7.5',
    resourceLimitMemory: '4Gi'
  ]) {
    props = readProperties(file: 'build.properties')
    String primaryBranch = props.primaryBranch
    assert primaryBranch != null && primaryBranch != ""

    stage('Merge') {
      // cancel build if primary branch doesn't merge cleanly
      gitMerge(primaryBranch)
    }

    stage('Install') {
      yarnInstall()
    }

    stage('Type check') {
      withEnv(["NODE_OPTIONS=--max-old-space-size=1936"]) {
        exec("yarn ci-all-seq")
      }
    }

    stage('Moxiedoc check') {
      sh 'yarn tinymce-grunt shell:moxiedoc'
    }
  }
  //

  def platforms = [
    [ browser: 'chrome', provider: 'aws', buckets: 2 ],
    [ browser: 'edge', provider: 'aws', buckets: 2 ],
    [ browser: 'firefox', provider: 'aws', buckets: 2 ],
    [ browser: 'safari', provider: 'lambdatest', buckets: 2 ]
  ];

  def processes = [:]
  def runAllTests = env.BRANCH_NAME == props.primaryBranch

  for (int i = 0; i < platforms.size(); i++) {
    def platform = platforms.get(i)
    def buckets = platform.buckets ?: 1
    for (int bucket = 1; bucket <= buckets; bucket ++) {
      def suffix = buckets == 1 ? "" : "-" + bucket
      def s_bucket = "${bucket}"
      def s_buckets = "${buckets}"
      def name = "${platform.browser}-${platform.provider}${suffix}"
      processes[name] = runTestPod(name, platform.browser, platform.provider, s_bucket, s_buckets, runAllTests)
    }
  }

  processes['headless'] = {
    tinyPods.nodeBrowser([
      resourceRequestCpu: '6',
      resourceRequestMemory: '4Gi',
      resourceLimitCpu: '7.5',
      resourceLimitMemory: '4Gi'
    ]) {
      stage('Test-headless') {
        yarnInstall()
        withEnv(["NODE_OPTIONS=--max-old-space-size=1936"]) {
          sh "yarn ci-all-seq"
        }
      }

      stage('test') {
        grunt('list-changed-headless')
        runHeadlessTests(runAllTests)
      }

      if (env.BRANCH_NAME != props.primaryBranch) {
        stage('Archive Build') {
          sh 'yarn tinymce-grunt prodBuild symlink:js'
          archiveArtifacts artifacts: 'js/**', onlyIfSuccessful: true
        }
      }
    }
  }

  stage('Run tests') {
      echo "Running tests [runAll=${runAllTests}]"
      parallel processes
  }
}