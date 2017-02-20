// Script to use for pipeline
node ("primary") {
  stage "Load shared pipelines"
  sh "mkdir -p jenkins-plumbing"
  dir ("jenkins-plumbing") {
    git ([url: "ssh://git@stash:7999/van/jenkins-plumbing.git", credentialsId: '8aa93893-84cc-45fc-a029-a42f21197bb3'])
  }
  def extBedrock = load("jenkins-plumbing/bedrock-tests.groovy")

  stage "Checkout project"
  sh "mkdir -p project"
  dir ("project") {  
    git ([url: "ssh://git@stash:7999/van/agar.git", credentialsId: '8aa93893-84cc-45fc-a029-a42f21197bb3', branch: "master"])

    stage "Fetching Dependencies"
    sh "npm install"   

    stage "Atomic Tests"
    sh "node_modules/.bin/bolt test config/bolt/atomic.js \$(find src/test/js/atomic -name *.js)"
  }

  def permutations = [
    [ name: "win10Chrome", os: "windows-10", browser: "chrome", sh: false ],
    // [ name: "win10FF", os: "windows-10", browser: "firefox", sh: false ],
    [ name: "win10Edge", os: "windows-10", browser: "MicrosoftEdge", sh: false ],
    [ name: "win10IE", os: "windows-10", browser: "ie", sh: false ]
  ]

  def processes = [:]
  for (int i = 0; i < permutations.size(); i++) {
    def permutation = permutations.get(i)
    processes[permutation.name] = {
      node("bedrock-" + permutation.os) {
        echo "Slave checkout"
        git([branch: "master", url:'ssh://git@stash:7999/van/agar.git', credentialsId: '8aa93893-84cc-45fc-a029-a42f21197bb3'])  
        
        echo "Fetching Slave Dependencies"
        if (permutation.sh) {
          sh "npm install"
        } else {
          bat "npm install"
        }
        
        echo "Browser Tests for " + permutation.name
        def webdriverTests = permutation.browser == "firefox" ? "" : " src/test/js/webdriver"
        extBedrock(permutation.name, permutation.browser, "src/test/js/browser" + webdriverTests, permutation.sh)
      }
    }
  }

  stage "Platform Tests"
  parallel processes

  echo "Build does not publish"
}