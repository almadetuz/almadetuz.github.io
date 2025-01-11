require 'rack/jekyll'
require 'yaml'
run Rack::Jekyll.new(auto:true, future:true)
