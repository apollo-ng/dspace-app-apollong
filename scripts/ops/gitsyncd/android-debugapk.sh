DEBUG=1
LOG='gitsyncd.log'

BUILD_DIR='/home/dspace/repo'

function log() {
  if [[ ${DEBUG} == 1 ]]; then
    TS=$(date +'%Y-%m-%d %H:%M:%S %Z')
    echo "${TS} - $1" >> ${LOG}; fi }

repo=$1
branch=${2#refs/heads/}

[ "x$branch" == "xmaster" ] && $branch=""
[ "x$branch" != "x" ] && branch="-$branch"

work="${BUILD_DIR}/$repo$branch"
echo "gitsync.sh: $work"

## create repo with 
## repo=dspace-client; branch=feature/deploy; 
## dir=$BUILD_DIR/$repo-$branch
## git clone -b $branch $dir
## cd $dir && make init
[[ -d $work ]] || exit 1;

cd $work
git fetch
git status -uno
test=$(git status -uno | grep "can be fast-forwarded");
if [[ "x$test" != "x" ]]; then
  git config user.email "dspace@dspace.ruebezahl.cc"
  git config user.name "dspace auto deploy"
  git stash
  git pull
  npm install 
  make android-debugapk ANDROID_BIN=/home/dspace/android-sdk-linux/tools/android
  install -d build/apk
  cp android/bin/*-debug.apk build/apk
fi

exit 0
