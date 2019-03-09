#!/bin/bash

# Converts all WAV files to OGG and MP3 if not already done

set -e

BASE_DIRECTORY=$1

if [ -z $BASE_DIRECTORY ] ; then
	echo "Please specify directory to convert"
	exit 1
fi

for f in $(find $BASE_DIRECTORY -name '*.wav') ; do
	FILE_WITHOUT_EXTENSION="${f%.*}"

	# WAV to MP3
	MP3_PATH=$FILE_WITHOUT_EXTENSION.mp3
	if ! [ -f $MP3_PATH ] ; then
		echo "Converting $f to MP3..."
		ffmpeg -i "$f" -c:a libmp3lame -q:a 2 $MP3_PATH 1>/dev/null
	fi

	# WAV to OGG
	OGG_PATH=$FILE_WITHOUT_EXTENSION.ogg
	if ! [ -f $OGG_PATH ] ; then
		echo "Converting $f to OGG..."
		ffmpeg -i "$f" -c:a libvorbis -q:a 4 $OGG_PATH 1>/dev/null
	fi
done

exit 0