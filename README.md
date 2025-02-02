# almadetuz.github.io
[Alma de Tüz website](https://www.almadetuz.com)


# Local environment - Ubuntu

Install ruby

```
sudo apt-get install ruby-full build-essential zlib1g-dev
```

Install gems in the user account

```
echo '# Install Ruby Gems to ~/gems' >> ~/.bashrc
echo 'export GEM_HOME="$HOME/gems"' >> ~/.bashrc
echo 'export PATH="$HOME/gems/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

Install Jekyll and Bundler

```
gem install jekyll bundler
```

Install gems
```
bundle install
```

Execute Jekyll to generate static files when something changes
```
bundle exec jekyll build --watch
```

In another terminal, executes Puma as webserver
```
bundle exec puma -p 4000
```


## References

* [Jekyll on Ubuntu](https://jekyllrb.com/docs/installation/ubuntu/)
