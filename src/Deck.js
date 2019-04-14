import React, { Component } from 'react';
import { 
    View,
    Animated,
    PanResponder,
    Dimensions
 } from 'react-native';


const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OFF_DURATION = 250


class Deck extends Component {

    static defaultProps = {
        onSwipeRight: () => {},
        onSwipeLeft: () => {}
    }


    constructor(props)
    {
        super(props);
        const position = new Animated.ValueXY();

        const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (event, gesture) => {
                position.setValue({ x: gesture.dx, y: gesture.dy });
            },
            onPanResponderRelease: (event, gesture) => {
                if(gesture.dx > SWIPE_THRESHOLD)
                {
                    this.forceSwipe('right');
                }
                else if(gesture.dx < -SWIPE_THRESHOLD)
                {
                    this.forceSwipe('left');
                }
                else
                {
                    this.resetPosition();
                }
                
            }
        });

        this.state = { panResponder, position, index: 0 };
    }

    forceSwipe(direction)
    {
       const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
       Animated.timing(this.state.position, {
           toValue: { x , y: 0 },
           duration: SWIPE_OFF_DURATION
       }).start(() => this.onSwipeComplete(direction));
    }

    onSwipeComplete(direction)
    {   
        //some functions for work on main app
        const { onSwipeLeft, onSwipeRight, data } = this.props;
        const item = data[this.state.index];


        direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
        this.state.position.setValue( { x: 0, y: 0 } );
        this.setState( { index: this.state.index + 1 } );

    }

    resetPosition()
    {
        Animated.spring(this.state.position, {
            toValue: {x:0, y: 0}
        }).start();
    }

    getCardStyle()
    {
        const { position } = this.state;
        const rotate = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5 ],
            outputRange: ['-120deg', '0deg', '120deg']
        });


        return {
            ...position.getLayout(),
            transform: [{ rotate }]
        };
    }

    renderCards()
    {  const { state: {index}, props: { data , renderNoMoreCards}} = this;
        if(index >= this.props.data.length)
        {
            return renderNoMoreCards();
        }


        return this.props.data.map(
            (item, i) => {
                if(i < this.state.index)
                {
                   return null; 
                }

                if(i === this.state.index)
                {
                    return (
                        <Animated.View 
                            key={ item.id } 
                            style={ {...this.getCardStyle(),...styles.cardStyle} }
                            {...this.state.panResponder.panHandlers} 
                        >
                        
                           { this.props.renderCard(item) }
                        </Animated.View>
                    );
                }
                
                return (
                    <View key={ item.id } style={ styles.cardStyle } >
                        { this.props.renderCard(item) }
                    </View>                     
                ); 
        }).reverse();
    }


    render()
    {
        return(
            <View>
                {this.renderCards()}
            </View>
        );
    }

}


const styles = {
    cardStyle: {
       position: 'absolute', 
       width: SCREEN_WIDTH,
       zIndex: 100
    }
};

export default Deck;