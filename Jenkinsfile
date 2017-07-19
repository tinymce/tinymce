def credentialsId = '8aa93893-84cc-45fc-a029-a42f21197bb3';
// Script to use for pipeline
node ("primary") {
  sh "mkdir -p project"
  
  dir("jenkins-plumbing") {
     git ([url: "ssh://git@stash:7999/van/jenkins-plumbing.git", credentialsId: credentialsId]) 
  }
  
  dir ("project") {  
    stage ("Checkout project") {
      git ([url: "ssh://git@stash:7999/van/agar.git", credentialsId: credentialsId, branch: "master"])
    }

    stage ("Fetching Dependencies") {
      sh "npm install"   
    }

    stage ("Atomic Tests") {
      sh "node_modules/.bin/bolt test config/bolt/atomic.js \$(find src/test/js/atomic -name *.js)"
    }
  }
  
  def extBedrock = load("jenkins-plumbing/bedrock-tests.groovy")
  def extExec = load("jenkins-plumbing/exec.groovy")

  def permutations = [
    [ name: "win10Chrome", os: "windows-10", browser: "chrome" ],
    [ name: "win10FF", os: "windows-10", browser: "firefox" ],
    [ name: "win10Edge", os: "windows-10", browser: "MicrosoftEdge" ],
    [ name: "win10IE", os: "windows-10", browser: "ie" ]
  ]

  def processes = [:]
  for (int i = 0; i < permutations.size(); i++) {
    def permutation = permutations.get(i)
    processes[permutation.name] = {
      node("bedrock-" + permutation.os) {
          
        echo "Slave checkout"
        git([branch: "master", url:'ssh://git@stash:7999/van/agar.git', credentialsId: credentialsId])  
        
        echo "Fetching Slave Dependencies"
        extExec("npm install")
        
        echo "Browser Tests for " + permutation.name
        def webdriverTests = permutation.browser == "firefox" ? "" : " src/test/js/webdriver"
        extBedrock(permutation.name, permutation.browser, "src/test/js/browser" + webdriverTests)
      }
    }
  }

  stage ("Platform Tests") {
    parallel processes
  }
  
}