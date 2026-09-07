import 'package:careconnect_mobile/core/routing/routes.dart';
import 'package:flutter_test/flutter_test.dart';
import '../support/harness.dart';

void main() {
  group('WelcomeScreen', () {
    testWidgets('renders all brand elements', (tester) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.welcome);
      expect(find.text('CareConnect'), findsOneWidget);
      expect(find.text('Your daily companion for calm, confident care.'), findsOneWidget);
      expect(find.text('Accessible'), findsOneWidget);
    });
    testWidgets('displays hearing accessibility features', (tester) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.welcome);
      expect(find.text('Built for hearing accessibility'), findsOneWidget);
      expect(find.text('Visual alerts'), findsOneWidget);
    });
    testWidgets('navigates to Sign Up', (tester) async {
      usePhoneSurface(tester);
      await pumpApp(tester, initialLocation: Routes.welcome);
      await tester.tap(find.textContaining('Get started'));
      await tester.pumpAndSettle();
      expect(find.text('Create your account'), findsOneWidget);
    });
  });
}
