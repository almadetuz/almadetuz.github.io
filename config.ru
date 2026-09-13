require 'rack/jekyll'
require 'yaml'
run Rack::Jekyll.new(auto:false, future:false)
