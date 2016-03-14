DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR
cd ../

cat src/shared/message_types.js \
src/content_script/helpers.js \
src/content_script/buffer_viewer.js \
src/content_script/frame_control.js \
src/content_script/program_usage_counter.js \
src/content_script/duplicate_program_detection.js \
src/content_script/pixel_inspector.js \
src/content_script/depth_inspector.js \
src/content_script/mipmap_viewer.js \
src/content_script/texture_viewer.js \
src/content_script/contexts.js \
src/content_script/messages.js \
src/content_script/message_handling.js \
src/content_script/call_stack.js \
src/content_script/histogram.js \
src/content_script/state_variables.js \
src/content_script/shader_viewer.js \
src/content_script/fcn_bindings.js \
src/content_script/webgl_bind.js \
| pbcopy
# | node build/content_script_build.js | pbcopy