import 'package:flutter/material.dart';
import '../widgets/home_banner.dart';
import '../widgets/media_row.dart';
import '../widgets/nav_dropdown.dart';
import '../widgets/profile_dropdown.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  bool _showNavMenu = false;
  bool _showProfileMenu = false;

  void _toggleNavMenu() {
    setState(() {
      _showNavMenu = !_showNavMenu;
      _showProfileMenu = false;
    });
  }

  void _toggleProfileMenu() {
    setState(() {
      _showProfileMenu = !_showProfileMenu;
      _showNavMenu = false;
    });
  }

  void _closeMenus() {
    setState(() {
      _showNavMenu = false;
      _showProfileMenu = false;
    });
  }

  void _goHome() {
    _closeMenus();
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const HomePage()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final movies = [
      MediaItem(title: 'Toy Story 5', imageUrl: 'https://image.tmdb.org/t/p/w342/6IyE0LmGh3AByCXykRfxWJqOKuY.jpg'),
      MediaItem(title: 'Michael', imageUrl: 'https://image.tmdb.org/t/p/w342/2AY6EQ6H0zGxu2FTG0k4bqUlUHm.jpg'),
      MediaItem(title: 'Obsession', imageUrl: 'https://image.tmdb.org/t/p/w342/9fCApNoRkc9JLnDdKF2Z6EM7ZTV.jpg'),
      MediaItem(title: 'Superman', imageUrl: 'https://image.tmdb.org/t/p/w342/8VG8fDNiy50H4FedGwdSVUPoaJe.jpg'),
      MediaItem(title: 'Deadpool 3', imageUrl: 'https://image.tmdb.org/t/p/w342/kZ2nHVdcbGeMkgOMSbeCcwvpiV6.jpg'),
      MediaItem(title: 'Dune Part Three', imageUrl: 'https://image.tmdb.org/t/p/w342/d5NXSklXo0qyIYkgV94XAgMIckC.jpg'),
    ];
    final shows = [
      MediaItem(title: 'The Last Airbender', imageUrl: 'https://image.tmdb.org/t/p/w342/qYTsRQNu1MdxTQ0BE0F7YOAOROq.jpg'),
      MediaItem(title: 'The Boys', imageUrl: 'https://image.tmdb.org/t/p/w342/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg'),
      MediaItem(title: 'Hunter x Hunter', imageUrl: 'https://image.tmdb.org/t/p/w342/sPCigirDtGGGWTz3vpiJ0kAsW4o.jpg'),
      MediaItem(title: 'Stranger Things', imageUrl: 'https://image.tmdb.org/t/p/w342/49WJfeN22Rf9YNKrCE8AtHAV0Rq.jpg'),
      MediaItem(title: 'The Bear', imageUrl: 'https://image.tmdb.org/t/p/w342/zPIeaLBqcOAgprQfw2CBOWyLh0G.jpg'),
      MediaItem(title: 'Severance', imageUrl: 'https://image.tmdb.org/t/p/w342/lFf6LLrQjYldcZItzOkGmMMigP7.jpg'),
    ];
    final music = [
      MediaItem(title: 'Album One', imageUrl: 'https://image.tmdb.org/t/p/w342/6IyE0LmGh3AByCXykRfxWJqOKuY.jpg'),
      MediaItem(title: 'Album Two', imageUrl: 'https://image.tmdb.org/t/p/w342/2AY6EQ6H0zGxu2FTG0k4bqUlUHm.jpg'),
      MediaItem(title: 'Album Three', imageUrl: 'https://image.tmdb.org/t/p/w342/9fCApNoRkc9JLnDdKF2Z6EM7ZTV.jpg'),
      MediaItem(title: 'Album Four', imageUrl: 'https://image.tmdb.org/t/p/w342/8VG8fDNiy50H4FedGwdSVUPoaJe.jpg'),
      MediaItem(title: 'Album Five', imageUrl: 'https://image.tmdb.org/t/p/w342/kZ2nHVdcbGeMkgOMSbeCcwvpiV6.jpg'),
      MediaItem(title: 'Album Six', imageUrl: 'https://image.tmdb.org/t/p/w342/d5NXSklXo0qyIYkgV94XAgMIckC.jpg'),
    ];
    final games = [
      MediaItem(title: 'Spider-Man 2', imageUrl: 'https://image.tmdb.org/t/p/w342/qYTsRQNu1MdxTQ0BE0F7YOAOROq.jpg'),
      MediaItem(title: 'Batman Arkham Knight', imageUrl: 'https://image.tmdb.org/t/p/w342/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg'),
      MediaItem(title: 'Red Dead Redemption', imageUrl: 'https://image.tmdb.org/t/p/w342/sPCigirDtGGGWTz3vpiJ0kAsW4o.jpg'),
      MediaItem(title: 'God of War', imageUrl: 'https://image.tmdb.org/t/p/w342/49WJfeN22Rf9YNKrCE8AtHAV0Rq.jpg'),
      MediaItem(title: 'Elden Ring', imageUrl: 'https://image.tmdb.org/t/p/w342/zPIeaLBqcOAgprQfw2CBOWyLh0G.jpg'),
      MediaItem(title: 'Zelda: Echoes', imageUrl: 'https://image.tmdb.org/t/p/w342/lFf6LLrQjYldcZItzOkGmMMigP7.jpg'),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFE1D9F0),
      appBar: AppBar(
        backgroundColor: const Color(0xFF7C6FD8),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.menu, color: Colors.white),
          onPressed: _toggleNavMenu,
        ),
        title: GestureDetector(
          onTap: _goHome,
          child: Row(
            children: [
              ColorFiltered(
                colorFilter: const ColorFilter.mode(Colors.white, BlendMode.srcIn),
                child: Image.asset('assets/images/logo.png', height: 36),
              ),
            ],
          ),
        ),
        actions: [
          const Icon(Icons.search, color: Colors.white),
          const SizedBox(width: 16),
          GestureDetector(
            onTap: _toggleProfileMenu,
            child: const Row(
              children: [
                Text('Jane Doe', style: TextStyle(color: Colors.white, fontSize: 16)),
                Icon(Icons.arrow_drop_down, color: Colors.white),
              ],
            ),
          ),
          const SizedBox(width: 12),
        ],
      ),
      body: GestureDetector(
        onTap: _closeMenus,
        behavior: HitTestBehavior.translucent,
        child: Stack(
          children: [
            ListView(
              padding: const EdgeInsets.only(top: 16, bottom: 24),
              children: [
                const HomeBanner(),
                const SizedBox(height: 24),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Text(
                    'Trending',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.deepPurple[700]),
                  ),
                ),
                const SizedBox(height: 12),
                MediaRow(categoryTitle: 'Movies', items: movies),
                MediaRow(categoryTitle: 'Shows', items: shows),
                MediaRow(categoryTitle: 'Music', items: music),
                MediaRow(categoryTitle: 'Games', items: games),
              ],
            ),
            NavDropdown(visible: _showNavMenu, onClose: _closeMenus),
            ProfileDropdown(visible: _showProfileMenu, onClose: _closeMenus),
          ],
        ),
      ),
    );
  }
}