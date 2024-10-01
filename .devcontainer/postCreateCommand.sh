#/bin/sh

echo "Declarative Gradle - VSCode Extension dev container post create script"
echo "======================================================================"

echo
echo "Installing dependencies"
echo "-----------------------"
npm install

echo
echo "Fetching the 'declarative-gradle' project into '/home/node'"
echo "------------------------------------------------------------"
git clone https://github.com/gradle/declarative-gradle /home/node/declarative-gradle