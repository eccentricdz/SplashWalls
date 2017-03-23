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
  Dimensions,
  PanResponder,
  CameraRoll,
  AlertIOS
} from 'react-native';

import RandManager from './rand-manager'
import Swiper from 'react-native-swiper'
import NetworkImage from 'react-native-image-progress'
import {Circle} from 'react-native-progress'
import Utils from './utils'

const WALL_COUNT = 5
const DOUBLTAP_DELAY = 300
const DOUBLETAP_RADIUS = 20
const {width, height} = Dimensions.get('window')

export default class SplashWalls extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: true,
      wallsJSON: [],
    }

    this.imagePanResponder = {}
    this.prevTouchInfo = {
      prevTouchX: 0,
      prevTouchY: 0,
      prevTouchTimeStamp: 0
    }
    this.currentWallIndex = 0
    this.handlePanResponderEnd = this.handlePanResponderEnd.bind(this)
    this.onMomentumScrollEnd = this.onMomentumScrollEnd.bind(this)
  }

  componentWillMount() {
    this.imagePanResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
      onPanResponderGrant: this.handlePanResponderGrant,
      onPanResponderRelease: this.handlePanResponderEnd,
      onPanResponderTerminate: this.handlePanResponderEnd
    })
  }

  componentDidMount() {
    this.fetchWallsJSON()
  }

  saveCurrentWallpaperToComeraRoll() {
    const {wallsJSON} = this.state;
    const currentWall = wallsJSON[this.currentWallIndex];
    const currentWallURL = `http://unsplash.it/${currentWall.width}/${currentWall.height}?image=${currentWall.id}`;

    CameraRoll.saveToCameraRoll(currentWallURL, 'photo', (data) => {
      AlertIOS.alert(
        'Saved',
        'Wallpaper successfully saved to Camera Roll',
        [
          {text: 'High 5!', onPress: () => console.log('OK Pressed!')}
        ]
      );
      },(err) =>{
      console.log('Error saving to camera roll', err);
    });
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

  handleStartShouldSetPanResponder(e, gestureState) {
    return true
  }

  handlePanResponderGrant(e, gestureState) {
  }

  handlePanResponderEnd(e, gestureState) {
    //console.log('The touch was released')
    currentTouchTimeStamp = Date.now();

    if(this.isDoubleTouch(currentTouchTimeStamp, gestureState))
      this.saveCurrentWallpaperToComeraRoll()

    this.prevTouchInfo = {
      prevTouchX: gestureState.x0,
      prevTouchY: gestureState.y0,
      prevTouchTimeStamp: currentTouchTimeStamp
    }
  }

  isDoubleTouch(currentTouchTimeStamp, {x0, y0}) {
    const {prevTouchX, prevTouchY, prevTouchTimeStamp} = this.prevTouchInfo
    if(currentTouchTimeStamp - prevTouchTimeStamp < DOUBLTAP_DELAY && Utils.distance(x0,y0,prevTouchX,prevTouchY) < DOUBLETAP_RADIUS)
      return true
    return false
  }

  onMomentumScrollEnd(e, state, context) {
    this.currentWallIndex = state.index
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
        style={{backgroundColor: '#000'}}
        onMomentumScrollEnd = {this.onMomentumScrollEnd}>
          {
            wallsJSON.map((wallpaper, index) => {
              return (
                <View key={index}>
                  <NetworkImage
                    source={{uri: `https://unsplash.it/${wallpaper.width}/${wallpaper.height}?image=${wallpaper.id}`}}
                    indicator={Circle}
                    style={styles.wallpaperImage}
                    indicatorProps = {
                      {
                        color: '#fff',
                        size: 60
                      }
                    }
                    {...this.imagePanResponder.panHandlers}
                    >
                    <Text style={styles.label}>Photo by</Text>
                    <Text style={styles.label_author}>{wallpaper.author}</Text>
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
    width: width,
    height: height,
    backgroundColor: 'transparent'
  },
  label: {
    position: 'absolute',
    top: 35,
    left: 10,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: width / 3,
    padding: 5,
    fontSize: 10
  },
  label_author: {
    position: 'absolute',
    top: 59,
    left: 10,
    width: width / 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    padding: 5,
    fontSize: 13,
    fontWeight: 'bold'
  }
});

AppRegistry.registerComponent('SplashWalls', () => SplashWalls);
