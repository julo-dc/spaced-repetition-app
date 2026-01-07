import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/supabase_config.dart';
import 'core/router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await SupabaseConfig.initialize();
  
  runApp(
    const ProviderScope(
      child: SpacedRepetitionApp(),
    ),
  );
}

class SpacedRepetitionApp extends StatelessWidget {
  const SpacedRepetitionApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Spaced Repetition',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.indigo,
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        cardTheme: CardThemeData(
          elevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
      routerConfig: appRouter,
    );
  }
}
