/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';

import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Dimensions
} from 'react-native';

import RandManager from './rand-manager'
import Swiper from 'react-native-swiper'
import NetworkImage from 'react-native-image-progress'
import Progress from 'react-native-progress'

const WALL_COUNT = 5
const {width, height} = Dimensions.get('window')

export default class SplashWalls extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: true,
      wallsJSON: []
    }
  }

  componentDidMount() {
    this.fetchWallsJSON()
  }

  fetchWallsJSON() {
    //console.log('Wallpapers will be fetched');
    const url = "https://unsplash.it/list"
    fetch(url)
      .then(res => res.json())
      .then(jsonRes => {
        const upper = jsonRes.length
        let walls = []
        const rnums = RandManager(WALL_COUNT, 0, upper)
        rnums.forEach(id => {
          walls.push(jsonRes[id])
        })
        this.setState({
          isLoading: false,
          wallsJSON: [].concat(walls)
        });
      })
      .catch(error => {
        console.log("There was an error while fetching JSON:"+error)
      })
  }

  renderLoadingMessage() {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          animating={true}
          color={'#fff'}
          size={'small'}
          style={styles.loader} />
        <Text style={styles.loadingText}>Contacting Unsplash</Text>
      </View>
    )
  }

  renderResults() {
    const {isLoading, wallsJSON} = this.state
    if (!isLoading) {
      return (
        <Swiper
        dotStyle={{backgroundColor:'rgba(255,255,255,.4)', width: 8, height: 8,borderRadius: 10, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3}}
        activeDotStyle = {{backgroundColor: '#fff', width: 13, height: 13, borderRadius: 7, marginLeft: 7, marginRight: 7}}
        loop={false}
        style={{backgroundColor: '#000'}}>
          {
            wallsJSON.map((wallpaper, index) => {
              return (
                <View key={index}>
                  <NetworkImage
                    source={{uri: `https://unsplash.it/${wallpaper.width}/${wallpaper.height}?image=${wallpaper.id}`}}
                    indicator={Progress.Circle}
                    style={styles.wallpaperImage}>
                  </NetworkImage>
                </View>
              )
            }
          )}
        </Swiper>
      )
    }
  }

  render() {
      const {isLoading} = this.state
      if(isLoading) {
        return this.renderLoadingMessage()
      }
      else {
        return this.renderResults();
      }
  }
}

const styles = StyleSheet.create({
  loader: {
    margin: 15
  },
  loadingText: {
    color: '#fff'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  },
  wallpaperImage: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: '#000'
  }
});

AppRegistry.registerComponent('SplashWalls', () => SplashWalls);
