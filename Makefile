PANDA_UPLOADER_VERSION = 1.1.2
PACKAGE_NAME = panda_uploader
SRC_ROOT = src
SRC_DIR = ${SRC_ROOT}/src
BUILD_DIR = ${SRC_ROOT}/build
TEST_DIR = ${SRC_ROOT}/test
PREFIX = .
DIST_DIR = ${PREFIX}
PANDA_DIST_DIR = ${DIST_DIR}/${PACKAGE_NAME}
PU_TAR = ${DIST_DIR}/${PACKAGE_NAME}.tar.gz
PU_CAT = ${DIST_DIR}/jquery.panda-uploader-${PANDA_UPLOADER_VERSION}.cat.js
PU_MIN = ${PANDA_DIST_DIR}/jquery.panda-uploader-${PANDA_UPLOADER_VERSION}.min.js
PU_FILES = ${SRC_DIR}/panda_uploader/base.js\
	${SRC_DIR}/panda_uploader/base_widget.js\
	${SRC_DIR}/panda_uploader/smart_widget.js\
	${SRC_DIR}/panda_uploader/flash_widget.js\
	${SRC_DIR}/panda_uploader/html5_widget.js\
	${SRC_DIR}/panda_uploader/base_strategy.js\
	${SRC_DIR}/panda_uploader/upload_on_submit.js\
	${SRC_DIR}/panda_uploader/upload_on_select.js\
	${SRC_DIR}/jquery.panda-uploader.js

TMP_PU_VERSION = ${SRC_DIR}/jquery.panda-uploader-${PANDA_UPLOADER_VERSION}.js
GENERATED = ${PU_MIN} ${PU_CAT} ${PU_TAR} ${TMP_PU_VERSION}

MINJAR = java -jar ${BUILD_DIR}/google-compiler-20100226.jar

MODULES = ${SRC_DIR}/swfobject.js\
	${SRC_DIR}/swfupload.js\
	${SRC_DIR}/jquery.swfupload.js\
	${TMP_PU_VERSION}

all: versionize min tar copy_to_test before_end
	@@rm -f ${TMP_PU_VERSION}
	@@echo "Panda uploader build complete."

debug: ${PU_CAT}

tar: ${PU_TAR}

min: ${PU_MIN}

copy_to_test:
	@@rm -rf ${TEST_DIR}/app/public/panda_uploader
	@@cp -pr ${PANDA_DIST_DIR} ${TEST_DIR}/app/public/panda_uploader
	@@cp ${PU_CAT} ${TEST_DIR}/app/public/panda_uploader/

versionize:
	@@echo "Generate version" ${PANDA_UPLOADER_VERSION}
	@@echo  "// version: ${PANDA_UPLOADER_VERSION}" > ${TMP_PU_VERSION}
	@@echo  "// name: ${PACKAGE_NAME}" >> ${TMP_PU_VERSION}
	@@echo  "" >> ${TMP_PU_VERSION}
	@@cat ${PU_FILES} >> ${TMP_PU_VERSION}
  
${PU_TAR}: ${PU_MIN}
	@@echo "Packaging as " ${PU_TAR}
	@@tar zcf ${PU_TAR} -C ${DIST_DIR} ${PACKAGE_NAME}

${PU_MIN}: ${PU_CAT}
	@@echo "Minifying" ${PU_CAT}
	@@${MINJAR} --js ${PU_CAT} --warning_level QUIET > ${PU_MIN}
	@@echo "Copying minified file to " ${PU_MIN}

before_end:
	@@rm -f ${PU_CAT}

${PU_CAT}: ${PU_FILES}
	@@echo "Building" ${PU_CAT}
	@@cat ${MODULES} > ${PU_CAT}

clean:
	@@echo "Removing Minimized js:" ${GENERATED}
	@@rm -f ${GENERATED}
