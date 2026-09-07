import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_theme.dart';
import '../../widgets/alert_banner.dart';
import '../../widgets/app_scaffold.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  bool _showAppointmentNotification = true;
  bool _isIncomingCall = false;
  bool _isActiveCall = false;
  late AnimationController _flashController;
  late Animation<double> _flashAnimation;
  double _volume = 80;
  double _balance = 0.5;
  bool _isMuted = false;
  bool _isPaused = false;
  bool _isCCEnabled = true;

  @override
  void initState() {
    super.initState();
    _flashController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500));
    _flashAnimation = Tween<double>(begin: 0.6, end: 1.0).animate(CurvedAnimation(parent: _flashController, curve: Curves.easeInOut));
  }

  @override
  void dispose() { _flashController.dispose(); super.dispose(); }

  void _simulateCall() { setState(() => _isIncomingCall = true); _flashController.repeat(reverse: true); }
  void _declineCall() { setState(() => _isIncomingCall = false); _flashController.stop(); }
  void _answerCall() { setState(() { _isIncomingCall = false; _isActiveCall = true; }); _flashController.stop(); }
  void _endCall() { setState(() => _isActiveCall = false); }

  @override
  Widget build(BuildContext context) {
    if (_isActiveCall) return Scaffold(body: _buildActiveCallOverlay());
    return AppScaffold(
      title: 'Dashboard',
      body: Stack(
        children: [
          _buildHomeContent(),
          if (_isIncomingCall) Positioned.fill(child: _buildIncomingCallOverlay()),
        ],
      ),
    );
  }

  Widget _buildHomeContent() {
    return ListView(
      padding: const EdgeInsets.all(AppTheme.gutter),
      children: [
        if (_showAppointmentNotification)
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: AlertBanner(
              tone: AlertTone.info, title: 'Upcoming appointment',
              message: 'You have a video call with Maria today at 3:00 PM.',
              action: FilledButton(onPressed: () => setState(() => _showAppointmentNotification = false), style: FilledButton.styleFrom(backgroundColor: AppColors.primaryDark, foregroundColor: Colors.white), child: const Text('OK')),
            ),
          ),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: AppColors.secondaryLight, borderRadius: BorderRadius.circular(AppTheme.radius), border: Border.all(color: AppColors.border)),
          child: Row(children: [
            Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: AppColors.primaryDark, borderRadius: BorderRadius.circular(4)), child: const Text('CC', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12))),
            const SizedBox(width: 12),
            const Expanded(child: Text('Upcoming: Video call with Maria at 3:00 PM', style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.primaryDark))),
          ]),
        ),
        const SizedBox(height: 24),
        Text("Here's your day, Margaret", style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontSize: 28, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        Row(children: [
          const Expanded(child: ClipRRect(borderRadius: const BorderRadius.all(Radius.circular(4)), child: LinearProgressIndicator(value: 0.3, backgroundColor: AppColors.secondaryLight, valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryDark), minHeight: 12))),
          const SizedBox(width: 16),
          Text('3 of 10 done', style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600, color: AppColors.secondaryDark)),
        ]),
        const SizedBox(height: 32),
        Text('Next thing to do', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 12),
        Card(
          elevation: 0, color: AppColors.secondaryLight, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radius), side: const BorderSide(color: AppColors.border, width: 1.5)),
          child: Padding(
            padding: const EdgeInsets.all(AppTheme.gutter),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                const CircleAvatar(radius: 28, backgroundColor: AppColors.primaryDark, child: Icon(Icons.video_call, color: Colors.white, size: 32)),
                const SizedBox(width: 16),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Video call with Maria', style: Theme.of(context).textTheme.titleLarge?.copyWith(color: AppColors.primaryDark)),
                  Text('3:00 PM · Starts in 10 mins', style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: AppColors.secondaryDark)),
                ])),
              ]),
              const SizedBox(height: 20),
              SizedBox(width: double.infinity, height: 56, child: FilledButton.icon(onPressed: _simulateCall, icon: const Icon(Icons.phone_callback), label: const Text('Simulate incoming call', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)), style: FilledButton.styleFrom(backgroundColor: AppColors.primaryDark, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radius))))),
            ]),
          ),
        ),
        const SizedBox(height: 32),
        Text('Later today', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 12),
        _buildTaskCard(icon: Icons.medication, title: 'Atorvastatin', subtitle: 'Take 1 pill with water', time: '5:00 PM'),
        const SizedBox(height: 12),
        _buildTaskCard(icon: Icons.monitor_heart, title: 'Blood pressure check', subtitle: 'Standard daily measurement', time: '8:00 PM'),
        const SizedBox(height: 40),
      ],
    );
  }

  Widget _buildTaskCard({required IconData icon, required String title, required String subtitle, required String time}) {
    return Card(elevation: 0, color: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radius), side: const BorderSide(color: AppColors.border)), child: ListTile(contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8), leading: CircleAvatar(backgroundColor: AppColors.secondaryLight, child: Icon(icon, color: AppColors.primaryDark)), title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)), subtitle: Text(subtitle), trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [Text(time, style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.secondaryDark)), const Icon(Icons.chevron_right, size: 20)])));
  }

  Widget _buildIncomingCallOverlay() {
    return AnimatedBuilder(animation: _flashAnimation, builder: (context, child) {
      return Container(
        color: Colors.black.withOpacity(0.8 * _flashAnimation.value),
        child: SafeArea(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          const Spacer(),
          const CircleAvatar(radius: 60, backgroundColor: AppColors.primaryDark, child: Icon(Icons.person, size: 80, color: Colors.white)),
          const SizedBox(height: 24),
          const Text('Maria', style: TextStyle(color: Colors.white, fontSize: 40, fontWeight: FontWeight.bold)),
          const Text('Your daughter', style: TextStyle(color: Colors.white70, fontSize: 22)),
          const Spacer(),
          Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: [
            _buildCallButton(icon: Icons.call_end, label: 'Decline', color: Colors.red, onPressed: _declineCall),
            _buildCallButton(icon: Icons.videocam, label: 'Answer', color: Colors.green, onPressed: _answerCall),
          ]),
          const SizedBox(height: 60),
        ])),
      );
    });
  }

  Widget _buildCallButton({required IconData icon, required String label, required Color color, required VoidCallback onPressed}) {
    return InkResponse(onTap: onPressed, radius: 80, child: Column(mainAxisSize: MainAxisSize.min, children: [
      Container(padding: const EdgeInsets.all(24), decoration: BoxDecoration(color: color, shape: BoxShape.circle, boxShadow: [BoxShadow(color: color.withOpacity(0.4), blurRadius: 12, spreadRadius: 2)]), child: Icon(icon, color: Colors.white, size: 40)),
      const SizedBox(height: 12),
      Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
    ]));
  }

  Widget _buildActiveCallOverlay() {
    return Container(
      color: AppColors.primaryDark,
      child: SafeArea(child: Padding(
        padding: const EdgeInsets.all(AppTheme.gutter),
        child: Column(children: [
          Row(children: [
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Maria', style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
              Text('Your daughter · Video call', style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 18)),
            ])),
            Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(6)), child: const Text('LIVE', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold))),
          ]),
          const Spacer(),
          Center(child: Stack(alignment: Alignment.bottomRight, children: [
            Container(width: 240, height: 240, decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(120), border: Border.all(color: Colors.white54, width: 2)), child: const Icon(Icons.person, size: 140, color: Colors.white)),
            Container(width: 90, height: 90, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(45), border: Border.all(color: AppColors.primaryDark, width: 4), boxShadow: const [BoxShadow(blurRadius: 8, color: Colors.black26)]), child: const Icon(Icons.person, size: 50, color: AppColors.primaryDark)),
          ])),
          const Spacer(),
          Container(width: double.infinity, padding: const EdgeInsets.all(20), decoration: BoxDecoration(color: Colors.black87, borderRadius: BorderRadius.circular(AppTheme.radius), border: Border.all(color: Colors.white24)), child: const Text('[CC LIVE] "Hi Mum! Can you hear me? I\'m calling to check in on you."', style: TextStyle(color: Colors.white, fontSize: 20, height: 1.4), textAlign: TextAlign.center)),
          const SizedBox(height: 24),
          _buildActiveCallControls(),
          const SizedBox(height: 32),
          SizedBox(width: double.infinity, height: 64, child: FilledButton.icon(onPressed: _endCall, icon: const Icon(Icons.call_end), label: const Text('End call', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)), style: FilledButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radius))))),
          const SizedBox(height: 8),
        ]),
      )),
    );
  }

  Widget _buildActiveCallControls() {
    return Column(children: [
      Row(children: [
        const Icon(Icons.volume_up, color: Colors.white, size: 28),
        Expanded(child: Slider(value: _volume, min: 0, max: 100, activeColor: Colors.white, inactiveColor: Colors.white24, onChanged: (value) => setState(() => _volume = value))),
        SizedBox(width: 40, child: Text('${_volume.toInt()}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
      ]),
      Row(children: [
        const Text('L', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        Expanded(child: Slider(value: _balance, activeColor: Colors.white, inactiveColor: Colors.white24, onChanged: (value) => setState(() => _balance = value))),
        const Text('R', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ]),
      const SizedBox(height: 16),
      Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: [
        _buildToggleButton(icon: _isMuted ? Icons.mic_off : Icons.mic, label: 'Mute', isActive: _isMuted, onPressed: () => setState(() => _isMuted = !_isMuted)),
        _buildToggleButton(icon: _isPaused ? Icons.play_arrow : Icons.pause, label: 'Pause', isActive: _isPaused, onPressed: () => setState(() => _isPaused = !_isPaused)),
        _buildToggleButton(icon: Icons.closed_caption, label: 'CC', isActive: _isCCEnabled, onPressed: () => setState(() => _isCCEnabled = !_isCCEnabled)),
      ]),
    ]);
  }

  Widget _buildToggleButton({required IconData icon, required String label, required bool isActive, required VoidCallback onPressed}) {
    final Color color = isActive ? Colors.white : Colors.white54;
    return InkWell(onTap: onPressed, borderRadius: BorderRadius.circular(12), child: Padding(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8), child: Column(children: [Icon(icon, color: color, size: 36), const SizedBox(height: 4), Text(label, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 16))])));
  }
}
