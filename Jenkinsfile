#!groovy
@Library('waluigi@release/7') _

standardProperties()

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
      runBedrockTest(command, runAll, retry - 1, timeout)
    } else {
      error("Unexpected error")
    }
  }
}

def runHeadlessTests(Boolean runAll) {
  def bedrockCmd = "yarn grunt headless-auto"
  runBedrockTest(bedrockCmd, runAll)
}

def runRemoteTests(String name, String browser, String provider, String platform, String arn, String bucket, String buckets, Boolean runAll, int retry = 0, int timeout = 0) {
  def awsOpts = " --sishDomain=sish.osu.tiny.work --devicefarmArn=${arn}"
  def platformName = platform != null ? " --platformName='${platform}'" : ""
  def bedrockCommand =
  "yarn browser-test" +
    " --chunk=400" +
    " --bedrock-browser=" + browser +
    " --remote=" + provider +
    " --bucket=" + bucket +
    " --buckets=" + buckets +
    " --name=" + name +
    "${provider == 'aws' ? awsOpts : ''}" +
    "${platformName}"
    runBedrockTest(bedrockCommand, runAll, retry, timeout)
}

def runTestPod(String name, String browser, String provider, String platform, String bucket, String buckets, Boolean runAll) {
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
          withCredentials([string(credentialsId: 'sish-publickey', variable: 'SISH_KEY')]) {
            sh 'echo "sish.osu.tiny.work ssh-ed25519 $SISH_KEY" >> ~/.ssh/known_hosts'
          }
        }
      }

      stage('Test') {
        yarnInstall()
        sh 'yarn ci'
        grunt('list-changed-browser')
        withRemoteCreds(provider) {
          int retry = provider == 'lambdatest' ? 3 : 0
          withCredentials([string(credentialsId: 'devicefarm-testgridarn', variable: 'DF_ARN')]) {
            runRemoteTests(name, browser, provider, platform, DF_ARN, bucket, buckets, runAll, retry, 180)
          }
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
    resourceRequestCpu: '2',
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

  def platforms = [
    [ browser: 'chrome', provider: 'aws', buckets: 3 ],
    [ browser: 'edge', provider: 'aws', buckets: 3 ],
    [ browser: 'firefox', provider: 'aws', buckets: 3 ],
    [ browser: 'safari', provider: 'lambdatest', buckets: 1 ],
    [ browser: 'chrome', provider: 'lambdatest', os: 'macOS Sonoma', buckets: 1],
    [ browser: 'firefox', provider: 'lambdatest', os: 'macOS Sonoma', buckets: 1]
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
      processes[name] = runTestPod(name, platform.browser, platform.provider, platform.os, s_bucket, s_buckets, runAllTests)
    }
  }

  processes['headless'] = {
    tinyPods.nodeBrowser([
      resourceRequestCpu: '2',
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
    }
  }

  stage('Run tests') {
      echo "Running tests [runAll=${runAllTests}]"
      parallel processes
  }
}