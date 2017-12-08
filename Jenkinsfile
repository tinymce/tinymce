node("primary") {
  echo "Checkout master branch"
  stage ("Checkout sugar") {
    git([branch: "jenkins-browser-testing", url:'ssh://git@stash:7999/libs/sugar.git', credentialsId: '8aa93893-84cc-45fc-a029-a42f21197bb3'])
  }

  stage ("Checkout shared pipelines") {
    sh "mkdir -p jenkins-plumbing"
    dir ("jenkins-plumbing") {
      git([branch: "master", url:'ssh://git@stash:7999/van/jenkins-plumbing.git', credentialsId: '8aa93893-84cc-45fc-a029-a42f21197bb3'])
    }
  }

  def extNpmInstall = load("jenkins-plumbing/npm-install.groovy")
  def extBedrock = load("jenkins-plumbing/bedrock-tests.groovy")
  def extExec = load("jenkins-plumbing/exec.groovy")

  stage("Building") {
    extNpmInstall ()
    extExec ("grunt")
  }

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
        git([branch: "jenkins-browser-testing", url:'ssh://git@stash:7999/libs/sugar.git', credentialsId: '8aa93893-84cc-45fc-a029-a42f21197bb3'])

        sshagent(credentials: ['8aa93893-84cc-45fc-a029-a42f21197bb3']) {
          echo "Installing tools"
          extNpmInstall ()

          echo "Platform: browser tests for " + permutation.name
          extBedrock(permutation.name, permutation.browser, "src/test/js/browser")
        }
      }
    }
  }

  stage ("Parallel Browser Tests") {
    parallel processes
  }
}