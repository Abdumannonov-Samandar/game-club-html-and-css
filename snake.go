package main

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/nsf/termbox-go"
)

type Point struct {
	X, Y int
}

type Game struct {
	Width, Height int
	Snake         []Point
	Food          Point
	Direction     Point
	GameOver      bool
	Score         int
}

func (g *Game) Init() {
	g.Width = 20
	g.Height = 15
	g.Snake = []Point{{X: 10, Y: 7}} // Markazda boshlash
	g.Direction = Point{X: 1, Y: 0}
	g.SpawnFood()
	g.GameOver = false
	g.Score = 0
}

func (g *Game) SpawnFood() {
	for {
		g.Food = Point{
			X: rand.Intn(g.Width),
			Y: rand.Intn(g.Height),
		}

		// Taom ilon tanasiga tegmasligini tekshirish
		collision := false
		for _, segment := range g.Snake {
			if segment.X == g.Food.X && segment.Y == g.Food.Y {
				collision = true
				break
			}
		}

		if !collision {
			break
		}
	}
}

func (g *Game) Update() {
	if g.GameOver {
		return
	}

	// Yangi boshni hisoblash
	head := g.Snake[0]
	newHead := Point{
		X: head.X + g.Direction.X,
		Y: head.Y + g.Direction.Y,
	}

	// Devorga urilishni tekshirish
	if newHead.X < 0 || newHead.X >= g.Width || newHead.Y < 0 || newHead.Y >= g.Height {
		g.GameOver = true
		return
	}

	// O'ziga urilishni tekshirish
	for i, segment := range g.Snake {
		if i > 0 && segment.X == newHead.X && segment.Y == newHead.Y {
			g.GameOver = true
			return
		}
	}

	// Ilonni harakatlantirish
	g.Snake = append([]Point{newHead}, g.Snake...)

	// Taomni eyishni tekshirish
	if newHead.X == g.Food.X && newHead.Y == g.Food.Y {
		g.Score++
		g.SpawnFood()
	} else {
		// Dumini olib tashlash
		g.Snake = g.Snake[:len(g.Snake)-1]
	}
}

func (g *Game) Draw() {
	fmt.Print("\033[H\033[2J") // Ekranni tozalash

	// Yuqori chegara
	for x := 0; x < g.Width+2; x++ {
		fmt.Print("██")
	}
	fmt.Println()

	// O'yin maydoni
	for y := 0; y < g.Height; y++ {
		fmt.Print("██") // Chap chegara
		for x := 0; x < g.Width; x++ {
			if x == g.Food.X && y == g.Food.Y {
				fmt.Print("🍎")
			} else {
				isSnake := false
				for _, segment := range g.Snake {
					if segment.X == x && segment.Y == y {
						fmt.Print("🟩")
						isSnake = true
						break
					}
				}
				if !isSnake {
					fmt.Print("  ")
				}
			}
		}
		fmt.Print("██") // O'ng chegara
		fmt.Println()
	}

	// Pastki chegara
	for x := 0; x < g.Width+2; x++ {
		fmt.Print("██")
	}
	fmt.Println()

	fmt.Printf("Score: %d\n", g.Score)
	fmt.Println("Controls: Arrow Keys to move, ESC to quit")
	
	if g.GameOver {
		fmt.Println("Game Over! Press SPACE to restart or ESC to quit")
	}
}

func main() {
	err := termbox.Init()
	if err != nil {
		panic(err)
	}
	defer termbox.Close()

	rand.Seed(time.Now().UnixNano())
	game := &Game{}
	game.Init()

	eventQueue := make(chan termbox.Event)
	go func() {
		for {
			eventQueue <- termbox.PollEvent()
		}
	}()

	ticker := time.NewTicker(200 * time.Millisecond) // Tezlikni sekinlashtirdim
	defer ticker.Stop()

	for {
		select {
		case ev := <-eventQueue:
			if ev.Type == termbox.EventKey {
				switch ev.Key {
				case termbox.KeyArrowUp:
					if game.Direction.Y == 0 { // Faqat gorizontal holatda vertikalga o'tish
						game.Direction = Point{X: 0, Y: -1}
					}
				case termbox.KeyArrowDown:
					if game.Direction.Y == 0 {
						game.Direction = Point{X: 0, Y: 1}
					}
				case termbox.KeyArrowLeft:
					if game.Direction.X == 0 { // Faqat vertikal holatda gorizontalga o'tish
						game.Direction = Point{X: -1, Y: 0}
					}
				case termbox.KeyArrowRight:
					if game.Direction.X == 0 {
						game.Direction = Point{X: 1, Y: 0}
					}
				case termbox.KeySpace:
					if game.GameOver {
						game.Init() // Yangi o'yin
					}
				case termbox.KeyEsc, termbox.KeyCtrlC:
					return
				}
			}
		case <-ticker.C:
			game.Update()
			game.Draw()

			if game.GameOver {
				// Game Over bo'lganda qandaydir harakatni kutish
			}
		}
	}
}